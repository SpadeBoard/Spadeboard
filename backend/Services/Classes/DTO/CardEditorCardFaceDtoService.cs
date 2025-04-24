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

        public async Task CreateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            Console.WriteLine("Card Editor Card Face Dto Service: Create DTO Async");
            await _cardFaceService.CreateNavAsync(cardEditorCardFaceDto.CardFace);

            Console.WriteLine("Card Editor Card Face Dto Service: Finished Card Face Service Create Nav Async");
            await _cardFaceElementPerCardFaceService.CreateAllNavByCardFaceIdAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardEditorCardFaceDto.CardFace);
        }

        public async Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardFaceIdAsync(int cardFaceId)
        {
            throw new NotImplementedException();
        }

        public async Task<CardEditorCardFaceDto?> GetDtoAsync(int id)
        {
            return await GetDtoAsyncByCardFaceIdAsync(id);
        }

        // TODO: GetAllDtoByCardId
        public async Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardId(int cardId)
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

        public async Task<CardEditorCardFaceDto?> GetDtoAsyncByCardFaceIdAsync(int id)
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

        public async Task UpdateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto)
        {
            foreach (var cfd in cardEditorCardFacesDto) {
                await UpdateDtoAsync(cfd);
            }
        }

        public async Task UpdateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            await _cardFaceElementPerCardFaceService.UpdateAllNavByCardFaceIdAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardEditorCardFaceDto.CardFace);
        }
    }
}