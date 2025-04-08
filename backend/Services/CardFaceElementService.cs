using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;

namespace Services
{
    public class CardFaceElementService(ApplicationDbContext context, IDndItemService dndItemService) : ICardFaceElementService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IDndItemService _dndItemService = dndItemService;

        public async Task<IEnumerable<CardFaceElement>> GetCardFaceElementsByCardFaceIdAsync(int cardFaceId)
        {
            return await _context.CardFaceElement
                .Where(element => element.CardFaceId == cardFaceId)
                .ToListAsync();
        }

        public async Task CreateCardFaceElementsDtoAsync(CardFaceElementDto[] cardFaceElementsDto, CardFace cardFace)
        {
            foreach (CardFaceElementDto cardFaceElementDto in cardFaceElementsDto) {
                await CreateCardFaceElementDtoAsync(cardFaceElementDto, cardFace);
            }
        }

        public async Task CreateCardFaceElementDtoAsync(CardFaceElementDto cardFaceElementDto, CardFace cardFace)
        {
            await CreateCardFaceElementNavAsync(cardFaceElementDto.CardFaceElement, cardFace);

            await _dndItemService.CreateCardFaceElementPerCardFaceAsync(cardFaceElementDto);
        }

        public async Task CreateCardFaceElementsNavCardFaceAsync(CardFaceElement[] cardFaceElements, CardFace cardFace)
        {
            foreach (CardFaceElement e in cardFaceElements)
            {
                await CreateCardFaceElementNavAsync(e, cardFace);
            }
        }
        public async Task UpdateCardFaceElementsNavAsync(CardFaceElement[] cardFaceElements)
        {
            foreach (CardFaceElement cardFaceElement in cardFaceElements)
            {
                await UpdateCardFaceElementNavAsync(cardFaceElement);
            }
        }

        public async Task UpdateCardFaceElementNavAsync(CardFaceElement cardFaceElement)
        {
            _context.Entry(cardFaceElement).State = EntityState.Modified;
        
            if (cardFaceElement.Style != null)
                _context.Entry(cardFaceElement.Style).State = EntityState.Modified;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(cardFaceElement.CardFaceElementId))
                {
                    throw;
                }
                else
                {
                    throw;
                }
            }
        }

        // TODO: Refactor, split this into DeleteCardFaceElementNavAsync and nest that in here
        public async Task DeleteCardFaceElementsNavAsync(CardFaceElement[] cardFaceElements) 
        {
            foreach (CardFaceElement cardFaceElement in cardFaceElements)
            {
                CardFaceElement elementToDelete = cardFaceElement;
                await DeleteCardFaceElementNavAsync(elementToDelete);
            }
        }

        public async Task DeleteCardFaceElementNavAsync(CardFaceElement cardFaceElement) 
        {
            _context.CardFaceElement.Remove(cardFaceElement);
            await _context.SaveChangesAsync();

            if (cardFaceElement.Style != null)
            {
                _context.Style.Remove(cardFaceElement.Style);
                await _context.SaveChangesAsync();
            }
        }

        public bool Exists(int id)
        {
            return _context.CardFaceElement.Any(e => e.CardFaceElementId == id);
        }

        public async Task<IEnumerable<CardFaceElement>> GetCardFaceElementsNavAsync()
        {
            var cardFaceElements = await _context.CardFaceElement.ToListAsync() ?? throw new NotImplementedException();

            // Create a new list to hold updated elements
            var CardFaceElementsNav = new List<CardFaceElement>();

            foreach (var cardFaceElement in cardFaceElements)
            {
                var e = await GetCardFaceElementNavAsync(cardFaceElement.CardFaceElementId);

                if (e != null)
                {
                   CardFaceElementsNav.Add(e); // Add the updated element to the new list
                }
            }

            return CardFaceElementsNav;
        }

        public async Task<IEnumerable<CardFaceElement>> GetCardFaceElementsNavByCardFaceId(int cardFaceId)
        {
            var cardFaceElements = await _context.CardFaceElement
                .Where(element => element.CardFaceId == cardFaceId)
                .ToListAsync();

            var CardFaceElementsNav = new List<CardFaceElement>();

            foreach (var cardFaceElement in cardFaceElements)
            {
                var e = await GetCardFaceElementNavAsync(cardFaceElement.CardFaceElementId);

                if (e != null)
                {
                   CardFaceElementsNav.Add(e); // Add the updated element to the new list
                }
            }

            return CardFaceElementsNav;
        }

        public async Task<CardFaceElement?> GetCardFaceElementAsync(int cardFaceElementId)
        {
            return await _context.CardFaceElement.FindAsync(cardFaceElementId);
        }

        public async Task<IEnumerable<CardFaceElement>> GetCardFaceElementsAsync()
        {
            return await _context.CardFaceElement.ToListAsync();
        }

        // FIXME: So this works with the other CardFaceElementDto function
        public async Task<CardFaceElement> GetCardFaceElementNavAsync(int cardFaceElementId)
        {
            var cardFaceElement = await _context.CardFaceElement.FindAsync(cardFaceElementId);
            
            if (cardFaceElement == null) {
                throw new NotImplementedException();
            }

            if (cardFaceElement.StyleId != null) {
                var style = await _context.Style.FindAsync(cardFaceElement.StyleId);

                if (style != null) {
                    cardFaceElement.Style = style;
                }
            }

            return cardFaceElement;
        }

        public async Task<IEnumerable<CardFaceElementDto>> GetCardFaceElementsDtoByCardFaceIdAsync(int cardFaceId) 
        {
            var cardFaceElements = await GetCardFaceElementsNavByCardFaceId(cardFaceId) ?? throw new Exception();
            var cardFaceElementsDto = new List<CardFaceElementDto>();

            foreach (CardFaceElement cardFaceElement in cardFaceElements) 
            {   
                // Object reference not set to an instance of an object.
                var cardFaceElementDto  = await GetCardFaceElementDtoAsync(cardFaceElement.CardFaceElementId, cardFaceId);
            
                if (cardFaceElementDto != null) {
                    cardFaceElementsDto.Add(cardFaceElementDto);
                }
            }

            return cardFaceElementsDto;
        }

        // TODO: Pass in the card face ID
        public async Task<CardFaceElementDto?> GetCardFaceElementDtoAsync(int cardFaceElementId, int cardFaceId)
        {
            var cardFaceElementPerCardFaceAsync = await _dndItemService.GetCardFaceElementPerCardFaceByCardFaceIdAsync(cardFaceElementId, cardFaceId);
            if (cardFaceElementPerCardFaceAsync == null)
            {
                return null;
            }

            var cardFaceElement = await GetCardFaceElementNavAsync(cardFaceElementPerCardFaceAsync.CardFaceElementId);
            if (cardFaceElement == null)
            {
                return null;
            }

            var dndItemDto = await _dndItemService.GetDndItemDtoByDndItemIdAndDndPositionIdAsync(cardFaceElementPerCardFaceAsync.DndItemId, cardFaceElementPerCardFaceAsync.DndPositionId);
            
            if (dndItemDto == null) {
                return null;
            }
            
            // Object reference not set to an instance of an object.
            CardFaceElementDto cardFaceElementDto = new() { // Object reference not set to an instance of an object
                CardFaceElement = cardFaceElement,
                DndItemDto = dndItemDto
            };

            return cardFaceElementDto;
        }

        public async Task CreateCardFaceElementNavAsync(CardFaceElement cardFaceElement, CardFace cardFace)
        {
            if (cardFaceElement.Style != null)
            {
                // ASSUMPTION: No need to set ID to 0 because it's already set to 0
                await _context.Style.AddAsync(cardFaceElement.Style);
            }

            // FIXED: Temporary to bypass the ID set in frontend issue
            cardFaceElement.CardFaceElementId = 0;
            cardFaceElement.CardFace = cardFace;
            await _context.CardFaceElement.AddAsync(cardFaceElement);
        }
    }
}