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

        public async Task<IEnumerable<CardFaceElement>> GetAllByCardFaceIdAsync(int cardFaceId)
        {
            return await _context.CardFaceElement
                .Where(element => element.CardFaceId == cardFaceId)
                .ToListAsync();
        }

        public async Task CreateAllDtoAsync(CardFaceElementDto[] cardFaceElementsDto, CardFace cardFace)
        {
            foreach (CardFaceElementDto cardFaceElementDto in cardFaceElementsDto) {
                cardFaceElementDto.CardFaceElement.CardFace = cardFace;
                await CreateDtoAsync(cardFaceElementDto);
            }
        }

        public async Task CreateDtoAsync(CardFaceElementDto cardFaceElementDto)
        {
            await CreateNavAsync(cardFaceElementDto.CardFaceElement);

            await _dndItemService.CreateCardFaceElementPerCardFaceAsync(cardFaceElementDto);
        }

        public async Task CreateAllNavCardFaceAsync(CardFaceElement[] cardFaceElements, CardFace cardFace)
        {
            foreach (CardFaceElement e in cardFaceElements)
            {
                e.CardFace = cardFace;

                await CreateNavAsync(e);
            }
        }
        public async Task UpdateAllNavAsync(CardFaceElement[] cardFaceElements)
        {
            foreach (CardFaceElement cardFaceElement in cardFaceElements)
            {
                await UpdateNavAsync(cardFaceElement);
            }
        }

        public async Task UpdateNavAsync(CardFaceElement cardFaceElement)
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

        public async Task UpdateAllDtoAsync(CardFaceElementDto[] cardFaceElementsDto)
        {
            foreach (CardFaceElementDto cardFaceElementDto in cardFaceElementsDto)
            {
                await UpdateDtoAsync(cardFaceElementDto);
            }
        }

        public async Task UpdateDtoAsync(CardFaceElementDto cardFaceElementDto)
        {
            if (cardFaceElementDto.CardFaceElement.Style != null)
            {
                _context.Entry(cardFaceElementDto.CardFaceElement.Style).State = EntityState.Modified;
            }

            if (cardFaceElementDto.DndItemDto.DndItem != null)
            {
                _context.Entry(cardFaceElementDto.DndItemDto.DndItem).State = EntityState.Modified;
            }

            if (cardFaceElementDto.DndItemDto.DndPosition != null)
            {
                _context.Entry(cardFaceElementDto.DndItemDto.DndPosition).State = EntityState.Modified;
            }

            if (cardFaceElementDto.DndItemDto.DndDragBoundary != null)
            {
                _context.Entry(cardFaceElementDto.DndItemDto.DndDragBoundary).State = EntityState.Modified;
            }

            context.Entry(cardFaceElementDto.CardFaceElement).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(cardFaceElementDto.CardFaceElement.CardFaceElementId))
                {
                    throw;
                }
                else
                {
                    throw;
                }
            }
        }

        // TODO: Refactor, split this into DeleteNavAsync and nest that in here
        public async Task DeleteAllNavAsync(CardFaceElement[] cardFaceElements) 
        {
            foreach (CardFaceElement cardFaceElement in cardFaceElements)
            {
                CardFaceElement elementToDelete = cardFaceElement;
                await DeleteNavAsync(elementToDelete);
            }
        }

        public async Task<bool> DeleteNavAsync(CardFaceElement cardFaceElement) 
        {
            _context.CardFaceElement.Remove(cardFaceElement);

            if (cardFaceElement.Style != null)
            {
                _context.Style.Remove(cardFaceElement.Style);
            }

            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public async Task CreateAsync(CardFaceElement item)
        {
            _context.CardFaceElement.Add(item);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateAsync(int id, CardFaceElement item)
        {
            if (id != item.CardFaceElementId)
                return false;

            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(id))
                {
                    return false;
                }
                else
                {
                    throw;
                }
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var cardFaceElement = await GetAsync(id);
            if (cardFaceElement == null)
            {
                return false;
            }

            _context.CardFaceElement.Remove(cardFaceElement);
            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public bool Exists(int id)
        {
            return _context.CardFaceElement.Any(e => e.CardFaceElementId == id);
        }

        public async Task<IEnumerable<CardFaceElement>> GetAllNavAsync()
        {
            var cardFaceElements = await _context.CardFaceElement
                .Include(element => element.CardFace)
                .Include(element => element.Style)
                .ToListAsync();

            return cardFaceElements;
        }

        public async Task<IEnumerable<CardFaceElement>> GetAllNavByCardFaceId(int cardFaceId)
        {
            var cardFaceElements = await _context.CardFaceElement
                .Where(element => element.CardFaceId == cardFaceId)
                .Include(element => element.CardFace)
                .Include(element => element.Style)
                .ToListAsync();

            return cardFaceElements;
        }

        public async Task<CardFaceElement?> GetAsync(int id)
        {
            return await _context.CardFaceElement.FindAsync(id);
        }

        public async Task<IEnumerable<CardFaceElement>> GetAllAsync()
        {
            return await _context.CardFaceElement.ToListAsync();
        }

        // FIXME: So this works with the other CardFaceElementDto function
        public async Task<CardFaceElement?> GetNavAsync(int id)
        {
            var cardFaceElement = await _context.CardFaceElement
                .Include(cardFaceElement => cardFaceElement.Style)
                .Include(cardFaceElement => cardFaceElement.CardFace)
                .FirstOrDefaultAsync(cardFaceElement => cardFaceElement.CardFaceElementId == id);
            
            return cardFaceElement;
        }

        public async Task<IEnumerable<CardFaceElementDto>> GetAllDtoByCardFaceIdAsync(int cardFaceId) 
        {
            var cardFaceElements = await GetAllNavByCardFaceId(cardFaceId) ?? throw new Exception();
            var cardFaceElementsDto = new List<CardFaceElementDto>();

            foreach (CardFaceElement cardFaceElement in cardFaceElements) 
            {   
                // Object reference not set to an instance of an object.
                var cardFaceElementDto  = await GetDtoAsync(cardFaceElement.CardFaceElementId, cardFaceId);
            
                if (cardFaceElementDto != null) {
                    cardFaceElementsDto.Add(cardFaceElementDto);
                }
            }

            return cardFaceElementsDto;
        }

        // TODO: Pass in the card face ID
        public async Task<CardFaceElementDto?> GetDtoAsync(int cardFaceElementId, int cardFaceId)
        {
            var cardFaceElementPerCardFaceAsync = await _dndItemService.GetCardFaceElementPerCardFaceByCardFaceIdAsync(cardFaceElementId, cardFaceId);
            if (cardFaceElementPerCardFaceAsync == null)
            {
                return null;
            }

            var cardFaceElement = await GetNavAsync(cardFaceElementPerCardFaceAsync.CardFaceElementId);
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

        public async Task CreateNavAsync(CardFaceElement cardFaceElement)
        {
            if (cardFaceElement.Style != null)
            {
                cardFaceElement.Style.StyleId = 0;
                await _context.Style.AddAsync(cardFaceElement.Style);
            }

            // TODO: Refactor the thing so that 1 card face element can be on multiple faces
            /*if (cardFaceElement.CardFace != null)
            {
                cardFaceElement.CardFace.CardFaceId = 0;
                await _context.CardFace.AddAsync(cardFaceElement.CardFace);
            }*/

            cardFaceElement.CardFaceElementId = 0;
            await _context.CardFaceElement.AddAsync(cardFaceElement);
        }
    }
}