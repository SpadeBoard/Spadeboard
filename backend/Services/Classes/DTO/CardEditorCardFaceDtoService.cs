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

// https://stackoverflow.com/questions/59753218/how-to-use-dbcontext-in-separate-class-library-net-core
// https://www.postgresql.org/docs/current/ddl-schemas.html#:~:text=Unlike%20databases%2C%20schemas%20are%20not,without%20interfering%20with%20each%20other.

// Main schema: bridge tables containing item, dnd position, game room id as well as bridge tables containing item ID and user ID


namespace Services
{
    public class CardEditorCardFaceDtoService(ApplicationDbContext context, ICardFacePerCardService cardFacePerCardService, ICardFaceService cardFaceService, ICardFaceElementPerCardFaceService cardFaceElementPerCardFaceService) : ICardEditorCardFaceDtoService
    {
        private readonly ICardFaceService _cardFaceService = cardFaceService;

        private readonly ICardFaceElementPerCardFaceService _cardFaceElementPerCardFaceService = cardFaceElementPerCardFaceService;
        private readonly ICardFacePerCardService _cardFacePerCardService = cardFacePerCardService;
        
        public async Task CreateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto)
        {
            foreach (var cfd in cardEditorCardFacesDto) {
                await CreateDtoAsync(cfd);
            }
        }

        public async Task CreateAllDtoFromExistingAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto) {
            foreach (var cfd in cardEditorCardFacesDto) {
                await  CreateDtoForGameRoomFromExistingDtoAsync(cfd);
            }
        }

        public async Task CreateDtoForGameRoomFromExistingDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            cardEditorCardFaceDto.CardFace.CardFaceId = 0;

            cardEditorCardFaceDto.CardFace.StyleId = 0;
            cardEditorCardFaceDto.CardFace.Style.StyleId = 0;

            Console.WriteLine(
                "cardEditorCardFaceDto.CardFace.CardFaceId: {0}, cardEditorCardFaceDto.CardFace.StyleId: {1}, cardEditorCardFaceDto.CardFace.Style.StyleId: {2}",
                cardEditorCardFaceDto.CardFace.CardFaceId,
                cardEditorCardFaceDto.CardFace.StyleId,
                cardEditorCardFaceDto.CardFace.Style != null ?  cardEditorCardFaceDto.CardFace.Style.StyleId.ToString() : "null"
            );

            Console.WriteLine("Card Editor Card Face Dto Service: Create DTO Async");
            await _cardFaceService.CreateNavAsync(cardEditorCardFaceDto.CardFace);

            Console.WriteLine("Card Editor Card Face Dto Service: Finished Card Face Service Create Nav Async");
            await _cardFaceElementPerCardFaceService.CreateAllNavByCardFaceIdFromExistingAllNavAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardEditorCardFaceDto.CardFace);
        }

        public async Task CreateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            Console.WriteLine("Card Editor Card Face Dto Service: Create DTO Async");
            await _cardFaceService.CreateNavAsync(cardEditorCardFaceDto.CardFace);

            Console.WriteLine("Card Editor Card Face Dto Service: Finished Card Face Service Create Nav Async");
            await _cardFaceElementPerCardFaceService.CreateAllNavByCardFaceIdAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardEditorCardFaceDto.CardFace);
        }

        public async Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardFaceIdAsync(long cardFaceId)
        {
            throw new NotImplementedException();
        }

        public async Task<CardEditorCardFaceDto?> GetDtoAsync(long id)
        {
            return await GetDtoAsyncByCardFaceIdAsync(id);
        }

        // TODO: GetAllDtoByCardId
        public async Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardId(long cardId)
        {
            var cfpc  = await _cardFacePerCardService.GetAllByCardId(cardId);
            // TODO: Use the bridge table to all the IDs
            List<CardEditorCardFaceDto> list = [];
        
            foreach (var c in cfpc)
            {
                var cecfd = await GetDtoAsyncByCardFaceIdAsync(c.CardFaceId);
            
                if (cecfd != null)
                    list.Add(cecfd);
            }

            return list;
        }

        public async Task<CardEditorCardFaceDto?> GetDtoAsyncByCardFaceIdAsync(long id)
        {
            var cardFace = await _cardFaceService.GetNavAsync(id);
            var elements = (await _cardFaceElementPerCardFaceService.GetAllNavByCardFaceIdAsync(id)).ToArray();

            // ASSUMPTION: All card elements have the same card face
            CardEditorCardFaceDto cfd =  new(){
                CardFace = cardFace,
                CardFaceElementsPerCardFace = elements
            };

            return cfd;
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
            return await _cardFaceElementPerCardFaceService.UpdateAllNavByCardFaceIdAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardEditorCardFaceDto.CardFace);
        }
    }
}