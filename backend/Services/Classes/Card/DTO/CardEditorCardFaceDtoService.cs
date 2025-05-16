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
using System.Linq;
using System.Linq.Expressions;

// https://stackoverflow.com/questions/59753218/how-to-use-dbcontext-in-separate-class-library-net-core
// https://www.postgresql.org/docs/current/ddl-schemas.html#:~:text=Unlike%20databases%2C%20schemas%20are%20not,without%20interfering%20with%20each%20other.

// Main schema: bridge tables containing item, dnd position, game room id as well as bridge tables containing item ID and user ID


namespace Services
{
    public class CardEditorCardFaceDtoService(ICardFacePerCardDtoService cardFacePerCardDtoService, ICardFaceDtoService cardFaceDtoService, ICardFaceElementPerCardFaceDtoService cardFaceElementPerCardFaceDtoService, ICardFaceService cardFaceService, ICardFaceElementPerCardFaceService cardFaceElementPerCardFaceService) : ICardEditorCardFaceDtoService
    {
        private readonly ICardFacePerCardDtoService _cardFacePerCardDtoService = cardFacePerCardDtoService;
        private readonly ICardFaceDtoService _cardFaceDtoService = cardFaceDtoService;
        private readonly ICardFaceElementPerCardFaceDtoService _cardFaceElementPerCardFaceDtoService = cardFaceElementPerCardFaceDtoService;

        public async Task<IEnumerable<CardEditorCardFaceDto>> CreateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto)
        {
            var results = new List<CardEditorCardFaceDto>();
            foreach (var cardEditorCardFaceDto in cardEditorCardFacesDto)
            {
                var result = await CreateDtoAsync(cardEditorCardFaceDto);
                results.Add(result);
            }
            return results;
        }

        public async Task<IEnumerable<CardEditorCardFaceDto>> CreateAllDtoFromExistingAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto)
        {
            var results = new List<CardEditorCardFaceDto>();
            foreach (var cardEditorCardFaceDto in cardEditorCardFacesDto)
            {
                var result = await CreateDtoFromExistingDtoAsync(cardEditorCardFaceDto);
                results.Add(result);
            }
            return results;
        }

        public async Task<CardEditorCardFaceDto> CreateDtoFromExistingDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            // TODO: This between section should be its own function here
            // -----------------------------------------------------
            cardEditorCardFaceDto.CardFace.CardFaceId = "0";
            cardEditorCardFaceDto.CardFace.StyleId = "0";
            
            if (cardEditorCardFaceDto.CardFace.Style != null) {
                cardEditorCardFaceDto.CardFace.Style.StyleId = "0";
            }

            Console.WriteLine(
                "cardEditorCardFaceDto.CardFace.CardFaceId: {0}, cardEditorCardFaceDto.CardFace.StyleId: {1}, cardEditorCardFaceDto.CardFace.Style.StyleId: {2}",
                cardEditorCardFaceDto.CardFace.CardFaceId,
                cardEditorCardFaceDto.CardFace.StyleId,
                cardEditorCardFaceDto.CardFace.Style != null ?  cardEditorCardFaceDto.CardFace.Style.StyleId.ToString() : "null"
            );
            // --------------------------------------------------------------------------
            var cardFace = await _cardFaceDtoService.CreateDtoNavAsync(cardEditorCardFaceDto.CardFace);

            return new CardEditorCardFaceDto
            {
                CardFace = cardFace,
                CardFaceElementsPerCardFace = (await _cardFaceElementPerCardFaceDtoService
    .CreateAllNavDtoByCardFaceIdFromExistingAllNavDtoAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardFace))
    .ToArray()
            };
        }

        public async Task<CardEditorCardFaceDto> CreateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            // TODO: Make a try catch statement here
            try
            {
                CardFaceDto cardFace = await _cardFaceDtoService.CreateDtoNavAsync(cardEditorCardFaceDto.CardFace);

                if (cardFace.CardFaceId == "0")
                    throw new Exception("Card face ID is not updated");

                return new CardEditorCardFaceDto
                {
                    CardFace = cardFace,
                    CardFaceElementsPerCardFace = (await _cardFaceElementPerCardFaceDtoService
        .CreateAllNavDtoByCardFaceDtoIdAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardFace))
        .ToArray()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception: {0}", ex.Message);
                throw;
            }
        }

        public async Task<CardEditorCardFaceDto?> GetDtoAsyncByCardFace(CardFaceDto cardFaceDto)
        {
            return new(){
                CardFace = cardFaceDto,
                CardFaceElementsPerCardFace = (await _cardFaceElementPerCardFaceDtoService.GetAllNavDtoByCardFaceDtoIdAsync(cardFaceDto.CardFaceId)).ToArray()
            };
        }

        public async Task<bool> UpdateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto)
        {
            var updated = true;

            foreach (var cfd in cardEditorCardFacesDto) {
                updated = await UpdateDtoAsync(cfd);
            
                if (updated == false)
                    return updated;
            }

            return updated;
        }

        public async Task<bool> UpdateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            return await _cardFaceElementPerCardFaceDtoService.UpdateAllDtoNavByCardFaceAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardEditorCardFaceDto.CardFace);
        }

        public async Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardId(string cardId)
        {
            // NOTE: Returns the navigational properties
            IEnumerable<CardFaceDto>? cfpc = await _cardFacePerCardDtoService.GetAllFacesDtoByCardId(cardId);

            var results = new List<CardEditorCardFaceDto>();

            foreach (var cardFace in cfpc)
            {
                var dto = await GetDtoAsyncByCardFace(cardFace);
                if (dto != null)
                {
                    results.Add(dto);
                }
            }

            return results;
        }


        public async Task<CardEditorCardFaceDto> CreateDtoNavAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            throw new NotImplementedException();
        }

        public async Task<CardEditorCardFaceDto> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoAsync(string id, CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            // TODO: Grab the card face, grab the card face elements, then delete them
            // TODO: Call _cardFaceElementPerCardFace.DeleteAllNavByCardFaceAsync
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
           return await  _cardFaceElementPerCardFaceDtoService.DeleteAllDtoNavByCardFaceAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardEditorCardFaceDto.CardFace);
        }

        public async Task<CardEditorCardFaceDto?> GetDtoAsync(string id)
        {
            throw new NotImplementedException();
        }

        public bool Exists(string id)
        {
            throw new NotImplementedException();
        }
    }
}