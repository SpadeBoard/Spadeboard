using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using Models.Bridge;
using Newtonsoft.Json;
using System.Linq;

// https://stackoverflow.com/questions/59753218/how-to-use-dbcontext-in-separate-class-library-net-core
// https://www.postgresql.org/docs/current/ddl-schemas.html#:~:text=Unlike%20databases%2C%20schemas%20are%20not,without%20interfering%20with%20each%20other.

// Main schema: bridge tables containing item, dnd position, game room id as well as bridge tables containing item ID and user ID


namespace Services
{
    public class CardEditorCardDtoService(ApplicationDbContext context, ICardFacePerCardDtoService cardFacePerCardDtoService, ICardDtoService cardDtoService, ICardEditorCardFaceDtoService cardEditorCardFaceDtoService, ICardPerOwnerDtoService cardPerOwnerDtoService, ICardPositionPerRoomDtoService cardPositionPerRoomDtoService) : ICardEditorCardDtoService
    {
        private readonly ICardDtoService _cardDtoService = cardDtoService;
        private readonly ICardFacePerCardDtoService _cardFacePerCardDtoService = cardFacePerCardDtoService;
        private readonly ICardPerOwnerDtoService _cardPerOwnerDtoService = cardPerOwnerDtoService;
        private readonly ICardEditorCardFaceDtoService _cardEditorCardFaceDtoService = cardEditorCardFaceDtoService;
        private readonly ICardPositionPerRoomDtoService _cardPositionPerRoomDtoService = cardPositionPerRoomDtoService;
        private readonly ApplicationDbContext _context = context;

        // ASSUMPTION: You can create a card for yourself, can't create a card for a room
        public async Task<CardEditorCardDto> CreateDtoAsync(CardEditorCardDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto.CardEditorCardFacesDto != null) {
                    dto.CardEditorCardFacesDto = (await _cardEditorCardFaceDtoService.CreateAllDtoAsync(dto.CardEditorCardFacesDto)).ToArray();
                }

                dto.Card = await  _cardDtoService.CreateDtoAsync(dto.Card);

                // TODO: Refactor this function and the other similar ones
                if (!String.IsNullOrEmpty(dto.OwnerId))
                {
                    CardPerOwnerDto cpo = new(){
                        CardId = dto.Card.CardId,
                        OwnerId = dto.OwnerId
                    };

                    await _cardPerOwnerDtoService.CreateDtoAsync(cpo);
                }

                await _cardFacePerCardDtoService.CreateAllDtoAsyncFromCardEditorCardDto(dto);
                await transaction.CommitAsync();
                return dto;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var dto = await GetDtoAsync(id);
                if (dto == null)
                {
                    return false;
                }

                if (dto.CardEditorCardFacesDto == null)
                {
                    throw new Exception("Card Editor Card Faces are null");
                }

                bool deleted = false;

                foreach (CardEditorCardFaceDto cardEditorCardFaceDto in dto.CardEditorCardFacesDto)
                {
                    deleted = await _cardFacePerCardDtoService.DeleteDtoByCardAndCardFaceAsync(dto.Card.CardId, cardEditorCardFaceDto.CardFace.CardFaceId);
                
                    if (!deleted) {
                        throw new Exception("Didn't delete record in Card Face Per Card");
                    }
                }

                // NOTE: Some cards are in rooms so those don't have owners
                if (!String.IsNullOrEmpty(dto.OwnerId))
                {
                    deleted = await _cardPerOwnerDtoService.DeleteDtoByCardIdAndOwnerIdAsync(dto.Card.CardId, dto.OwnerId);
                
                    if (!deleted) {
                        throw new Exception("Didn't delete record in Card Per Owner");
                    }
                } 

                // NOTE: We're assuming there's only one card one position one dnd item 
                CardPositionPerRoomDto? cpr = await _cardPositionPerRoomDtoService.GetDtoByCardIdAsync(dto.Card.CardId);

                if (cpr == null) {
                    deleted = await _cardDtoService.DeleteDtoAsync(dto.Card.CardId);

                    if (!deleted)
                    {
                        throw new Exception("Didn't delete record in Card");
                    }
                }
                else
                {
                    deleted = await _cardPositionPerRoomDtoService.DeleteDtoNavAsync(cpr.CardPositionPerRoomId);
                
                     if (!deleted)
                    {
                        throw new Exception("Didn't delete record in Card Position Per Room and all subsequent navigational properties");
                    }
                }

                foreach (CardEditorCardFaceDto cardEditorCardFaceDto in dto.CardEditorCardFacesDto)
                {
                    deleted = await _cardEditorCardFaceDtoService.DeleteDtoAsync(cardEditorCardFaceDto);        
                
                    if (!deleted)
                    {
                        throw new Exception("Card face and card face elements per card face weren't deleted");
                    }
                }

                await transaction.CommitAsync();
                return deleted;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        public async Task<CardEditorCardDto?> GetDtoAsync(string id)
        {
            CardDto? card = await _cardDtoService.GetDtoAsync(id);
            
            if (card == null)
                return null;

            CardEditorCardDto dto = new()
            {
                Card = card
            };

            // TODO: Get all card faces by Card ID -> bridge table inside of CardEditorCardFAceDtoService to then grab the CardEditorCardFaceDto too
            dto.CardEditorCardFacesDto = (await _cardEditorCardFaceDtoService.GetAllDtoByCardId(dto.Card.CardId)).ToArray();

            CardPerOwnerDto? cpo = await _cardPerOwnerDtoService.GetDtoByCardIdAsync(dto.Card.CardId);

            if (cpo != null) 
                dto.OwnerId = cpo.OwnerId;

            // FIXME: Grab the styling for the card face elements as well as card faces
            return dto;
        }

        public async Task<bool> UpdateDtoAsync(string id, CardEditorCardDto dto)
        {
            if (id != dto.Card.CardId)
            {
                return false;
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                bool updated = false;

                if (dto.CardEditorCardFacesDto != null) {
                   updated =  await  _cardEditorCardFaceDtoService.UpdateAllDtoAsync(dto.CardEditorCardFacesDto);
                }

                updated = await _cardDtoService.UpdateDtoAsync(dto.Card.CardId, dto.Card);

                await transaction.CommitAsync();
                return updated;
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();

                if (!_cardDtoService.Exists(dto.Card.CardId))
                {
                    return false;
                }
                else
                {
                    throw;
                }
            }
            catch (Exception) 
            {
                await transaction.RollbackAsync();            
                throw;
            }
        }

        public bool Exists(string id) 
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<CardEditorCardDto>> GetAllDtoAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<CardEditorCardDto> CreateDtoNavAsync(CardEditorCardDto cardEditorCardDto)
        {
            throw new NotImplementedException();
        }

        public async Task<CardEditorCardDto> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardEditorCardDto cardEditorCardDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }
    }
}