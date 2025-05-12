using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using Algorithms;


namespace Services
{
    public class CardFaceElementService(ApplicationDbContext context,  ICardFaceService cardFaceService, IDndItemService dndItemService, IStyleService styleService, IFileUploadService fileUploadService) : ICardFaceElementService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICardFaceService _cardFaceService = cardFaceService;
        private readonly IDndItemService _dndItemService = dndItemService;
        private readonly IStyleService _styleService = styleService;
        private readonly IFileUploadService _fileUploadService = fileUploadService;

        public async Task<bool> UpdateAllNavAsync(CardFaceElement[] cardFaceElements)
        {
            foreach (CardFaceElement cardFaceElement in cardFaceElements)
            {
                var updated = await UpdateNavAsync(cardFaceElement);

                if (!updated) {
                    return false;
                }
            }

            return true;
        }

        public async Task<bool> UpdateNavAsync(CardFaceElement cardFaceElement)
        {
            if (cardFaceElement.Style != null /*&& _styleService.IsModified(cardFaceElement.Style)*/)
                _context.Entry(cardFaceElement.Style).State = EntityState.Modified;
            
            _context.Entry(cardFaceElement).State = EntityState.Modified;
        
            try
            {
                return await _context.SaveChangesAsync() > 0;
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

        // TODO: Refactor, split this into DeleteNavAsync and nest that in here
        public async Task DeleteAllNavAsync(CardFaceElement[] cardFaceElements) 
        {
            foreach (CardFaceElement cardFaceElement in cardFaceElements)
            {
                CardFaceElement elementToDelete = cardFaceElement;
                await DeleteNavAsync(elementToDelete.CardFaceElementId);
            }
        }

        public async Task<bool> DeleteNavAsync(long id) 
        {
            var cardFaceElement= await GetNavAsync(id);
            
            if (cardFaceElement == null)
            {
                return false;
            }

            if (cardFaceElement.CardFaceElementType == "image" && cardFaceElement.CardFaceElementContent != null) {
                await _fileUploadService.DeleteCardFaceElementImageFileAsync(cardFaceElement.CardFaceElementContent);
            }

            _context.CardFaceElement.Remove(cardFaceElement);

            if (cardFaceElement.Style != null)
            {
                _context.Style.Remove(cardFaceElement.Style);
            }

            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public async Task<CardFaceElement> CreateAsync(CardFaceElement item)
        {
            item.CardFaceElementId = Snowflake.NewId();
            // item.CardFaceElementId = 0;
            await _context.CardFaceElement.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> UpdateAsync(long id, CardFaceElement item)
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

        public async Task<bool> DeleteAsync(long id)
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

        public bool Exists(long id)
        {
            return _context.CardFaceElement.Any(e => e.CardFaceElementId == id);
        }

        public bool IsModified(CardFaceElement item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }

        public async Task<IEnumerable<CardFaceElement>> GetAllNavAsync()
        {
            var cardFaceElements = await _context.CardFaceElement
                .Include(element => element.Style)
                .ToListAsync();

            return cardFaceElements;
        }

        public async Task<CardFaceElement?> GetAsync(long id)
        {
            return await _context.CardFaceElement.FindAsync(id);
        }

        public async Task<IEnumerable<CardFaceElement>> GetAllAsync()
        {
            return await _context.CardFaceElement.ToListAsync();
        }

        // FIXME: So this works with the other CardFaceElementDto function
        public async Task<CardFaceElement?> GetNavAsync(long id)
        {
            var cardFaceElement = await _context.CardFaceElement
                .Include(cardFaceElement => cardFaceElement.Style)
                .FirstOrDefaultAsync(cardFaceElement => cardFaceElement.CardFaceElementId == id);
            
            return cardFaceElement;
        }

        public async Task<CardFaceElement> CreateNavAsync(CardFaceElement nav)
        {
            if (nav.Style == null)
            {
                throw new ArgumentException("Item: Card Face Element\nFunction: Create Nav Async\nThe Style property of CardFaceElement cannot be null.", nameof(nav));
            }

            if (_styleService.Exists(nav.Style.StyleId))
            {
                throw new ArgumentException("Item: Card Face Element\nFunction: Create Nav Async\nThe Style property of CardFaceElement has already been made.", nameof(nav));
            }

            nav.Style.StyleId = Snowflake.NewId();
            nav.CardFaceElementId = Snowflake.NewId();
            
            await _context.CardFaceElement.AddAsync(nav);
            int changes = await _context.SaveChangesAsync();

            if (changes <= 0)
                throw new Exception("No changes were made");

            await _context.Entry(nav).Reference(e => e.Style).LoadAsync();

            return nav;
        }
    }
}