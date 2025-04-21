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

// https://stackoverflow.com/questions/59753218/how-to-use-dbcontext-in-separate-class-library-net-core
// https://www.postgresql.org/docs/current/ddl-schemas.html#:~:text=Unlike%20databases%2C%20schemas%20are%20not,without%20interfering%20with%20each%20other.

// Main schema: bridge tables containing item, dnd position, game room id as well as bridge tables containing item ID and user ID


namespace Services
{
    public class CardEditorCardDtoService(ApplicationDbContext context, ICardFacePerCardService cardFacePerCardService, ICardService cardService, ICardFaceService cardFaceService, ICardEditorCardFaceDtoService cardEditorCardFaceDtoService, ICardPerOwnerService cardPerOwnerService, ICardFaceElementService cardFaceElementService, ICardFaceElementDtoService cardFaceElementDtoService) : ICardEditorCardDtoService
    {
        private readonly ICardService _cardService = cardService;
        private readonly ICardFacePerCardService _cardFacePerCardService = cardFacePerCardService;
        private readonly ICardPerOwnerService _cardPerOwnerService = cardPerOwnerService;
        private readonly ICardEditorCardFaceDtoService _cardEditorCardFaceDtoService = cardEditorCardFaceDtoService;

        private readonly ApplicationDbContext _context = context;

        public async Task CreateDtoAsync(CardEditorCardDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto.CardEditorCardFacesDto != null) {
                    await _cardEditorCardFaceDtoService.CreateAllDtoAsync(dto.CardEditorCardFacesDto);
                }
                
                /*if (dto.FrontCardFaceElementsDto != null)
                    await _cardFaceElementDtoService.CreateAllDtoAsync(dto.FrontCardFaceElementsDto, dto.FrontCardFace);

                if (dto.BackCardFaceElementsDto != null)
                    await _cardFaceElementDtoService.CreateAllDtoAsync(dto.BackCardFaceElementsDto, dto.BackCardFace);

                Console.WriteLine("Card Face Elements Created - Front: {0}, Back: {1}",
                    dto.FrontCardFaceElementsDto != null 
                        ? JsonConvert.SerializeObject(dto.FrontCardFaceElementsDto, Formatting.Indented) 
                        : "none",
                    dto.BackCardFaceElementsDto != null 
                        ? JsonConvert.SerializeObject(dto.BackCardFaceElementsDto, Formatting.Indented) 
                        : "none");

                dto.Card.FrontCardFace = dto.FrontCardFace;
                dto.Card.BackCardFace = dto.BackCardFace;

                Console.WriteLine(String.Format("Front card face ID: {0}, back card face ID: {1}", dto.FrontCardFace.CardFaceId, dto.BackCardFace.CardFaceId));*/

                await  _cardService.CreateAsync(dto.Card);

                CardPerOwner cpo = new(){
                    Card = dto.Card,
                    OwnerId = dto.OwnerId
                };

                await _cardPerOwnerService.CreateAsync(cpo);
                await _cardFacePerCardService.CreateAsyncFromCardEditorCardDto(dto);

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteDtoAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // TODO: Delete from cardPerOwner table, and if there's no owner left associated with the card, delete the card too, probably make a universal interface to check whether there's an owner for the item
                var dto = await GetDtoAsync(id);
                if (dto == null)
                {
                    return false;
                }

                await _cardService.DeleteAsync(dto.Card.CardId);

                /*if (dto.FrontCardFace != null)
                {
                    Console.WriteLine("Delete front dto face");
                    await _cardFaceService.DeleteNavAsync(dto.FrontCardFace);
                }

                if (dto.BackCardFace != null)
                {
                    Console.WriteLine("Delete back dto face");
                    await _cardFaceService.DeleteNavAsync(dto.BackCardFace);
                }*/

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<CardEditorCardDto?> GetDtoAsync(int id)
        {
            Card? card = await _cardService.GetAsync(id);
            
            if (card == null)
                return null;

            CardEditorCardDto dto = new()
            {
                Card = card
            };

            // TODO: Get all card faces by Card ID -> bridge table inside of CardEditorCardFAceDtoService to then grab the CardEditorCardFaceDto too
            dto.CardEditorCardFacesDto = (await _cardEditorCardFaceDtoService.GetAllDtoByCardId(dto.Card.CardId)).ToArray();

            /*CardFace? frontCardFace = await _cardFaceService.GetNavAsync(card.FrontCardFaceId);
            CardFace? backCardFace = await _cardFaceService.GetNavAsync(card.BackCardFaceId);
            
            if (frontCardFace == null && backCardFace == null)
            {
                return null;
            }

            if (frontCardFace != null)
                dto.FrontCardFace = frontCardFace;

            if (backCardFace != null)
                dto.BackCardFace = backCardFace;

            // TODO: Modify it so that the elements are using the bridge table and not by foreign key relationships
            var frontCardFaceElementsDto = await _cardFaceElementDtoService.GetAllDtoByCardFaceIdAsync(card.FrontCardFaceId);
            var backCardFaceElementsDto = await _cardFaceElementDtoService.GetAllDtoByCardFaceIdAsync(card.BackCardFaceId);

            if (frontCardFaceElementsDto != null) {
                dto.FrontCardFaceElementsDto = frontCardFaceElementsDto.ToArray<CardFaceElementDto>();
            }

            if (backCardFaceElementsDto != null) {
                dto.BackCardFaceElementsDto = backCardFaceElementsDto.ToArray<CardFaceElementDto>();
            }*/

            CardPerOwner? cpo = await _cardPerOwnerService.GetByCardIdAsync(dto.Card.CardId);

            if (cpo != null) 
                dto.OwnerId = cpo.OwnerId;

              // FIXME: Grab the styling for the card face elements as well as card faces
            return dto;
        }

        public async Task<bool> UpdateDtoAsync(int id, CardEditorCardDto dto)
        {
            if (id != dto.Card.CardId)
            {
                return false;
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // TODO
                // 1. Grab the card
                // 2. Grab the foreign keys of the card
                // 3. Get those card faces and card face elements based on the card Dto
                // 4. Then update and return it
                _context.Entry(dto.Card).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                /*if (dto.FrontCardFace != null) 
                {
                    await _cardFaceService.UpdateNavAsync(dto.FrontCardFace);
                }

                if (dto.BackCardFace != null) 
                {
                    await _cardFaceService.UpdateNavAsync(dto.BackCardFace);
                }

                if (dto.FrontCardFaceElementsDto != null)
                {
                    await _cardFaceElementDtoService.UpdateAllDtoAsync(dto.FrontCardFaceElementsDto);
                }

                if (dto.BackCardFaceElementsDto != null)
                {
                    await _cardFaceElementDtoService.UpdateAllDtoAsync(dto.BackCardFaceElementsDto);
                }*/

                await transaction.CommitAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();

                if (!_cardService.Exists(dto.Card.CardId))
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
    }
}