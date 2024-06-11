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
    public class CardFaceElementService(ApplicationDbContext context) : ICardFaceElementService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task<IEnumerable<CardFaceElement>> GetCardFaceElementsByCardFaceId(int cardFaceId)
        {
            return await _context.CardFaceElement
                .Where(element => element.CardFaceId == cardFaceId)
                .ToListAsync();
        }

        public void SetCardFaceElementsCardFace(CardFaceElement[] cardFaceElements, CardFace cardFace)
        {
            foreach (CardFaceElement e in cardFaceElements)
            {
                if (e.Style != null)
                {
                    // ASSUMPTION: No need to set ID to 0 because it's already set to 0
                    _context.Style.Add(e.Style);
                }

                e.CardFaceElementId = 0; // FIXED: Temporary to bypass the ID set in frontend issue
                e.CardFace = cardFace;
                
                _context.CardFaceElement.Add(e);
            }
        }

        public async Task SetCardFaceElementsCardFaceAsync(CardFaceElement[] cardFaceElements, CardFace cardFace)
        {
            foreach (CardFaceElement e in cardFaceElements) {
                if (e.Style != null)
                {
                    // ASSUMPTION: No need to set ID to 0 because it's already set to 0
                    await _context.Style.AddAsync(e.Style);
                }
                
                // FIXED: Temporary to bypass the ID set in frontend issue
                e.CardFaceElementId = 0;
                e.CardFace = cardFace;
                await _context.CardFaceElement.AddAsync(e);
            }
        }


        public async Task UpdateCardFaceElementsDtoAsync(CardFaceElement[] cardFaceElements)
        {
            foreach (CardFaceElement cardFaceElement in cardFaceElements)
            {
                await UpdateCardFaceElementDtoAsync(cardFaceElement);
            }
        }

        public async Task UpdateCardFaceElementDtoAsync(CardFaceElement cardFaceElement)
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

        // TODO: Refactor, split this into DeleteCardFaceElementDtoAsync and nest that in here
        public async Task DeleteCardFaceElementsDtoAsync(CardFaceElement[] cardFaceElements) 
        {
            foreach (CardFaceElement cardFaceElement in cardFaceElements)
            {
                CardFaceElement elementToDelete = cardFaceElement;
                await DeleteCardFaceElementDtoAsync(elementToDelete);
            }
        }

        public async Task DeleteCardFaceElementDtoAsync(CardFaceElement cardFaceElement) 
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

        public async Task<IEnumerable<CardFaceElement>> GetCardFaceElementsDtoAsync()
        {
            var cardFaceElements = await _context.CardFaceElement.ToListAsync() ?? throw new NotImplementedException();

            // Create a new list to hold updated elements
            var CardFaceElementsDto = new List<CardFaceElement>();

            foreach (var cardFaceElement in cardFaceElements)
            {
                var e = await GetCardFaceElementDtoAsync(cardFaceElement.CardFaceElementId);

                if (e != null)
                {
                   CardFaceElementsDto.Add(e); // Add the updated element to the new list
                }
            }

            return CardFaceElementsDto;
        }

        public async Task<IEnumerable<CardFaceElement>> GetCardFaceElementsDtoByCardFaceId(int cardFaceId)
        {
            var cardFaceElements = await _context.CardFaceElement
                .Where(element => element.CardFaceId == cardFaceId)
                .ToListAsync();

            var CardFaceElementsDto = new List<CardFaceElement>();

            foreach (var cardFaceElement in cardFaceElements)
            {
                var e = await GetCardFaceElementDtoAsync(cardFaceElement.CardFaceElementId);

                if (e != null)
                {
                   CardFaceElementsDto.Add(e); // Add the updated element to the new list
                }
            }

            return CardFaceElementsDto;
        }

        public async Task<CardFaceElement?> GetCardFaceElementAsync(int cardFaceElementId)
        {
            return await _context.CardFaceElement.FindAsync(cardFaceElementId);
        }

        public async Task<IEnumerable<CardFaceElement>> GetCardFaceElementsAsync()
        {
            return await _context.CardFaceElement.ToListAsync();
        }

        public async Task<CardFaceElement> GetCardFaceElementDtoAsync(int cardFaceElementId)
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
    }
}