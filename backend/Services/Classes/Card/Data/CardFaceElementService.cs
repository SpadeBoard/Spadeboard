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
    public class CardFaceElementService(ApplicationDbContext context, IStyleService styleService, IFileUploadService fileUploadService) : ICardFaceElementService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IStyleService _styleService = styleService;
        private readonly IFileUploadService _fileUploadService = fileUploadService;

        private readonly CrudService<CardFaceElement> _crudService = new(context, cardFaceElement => cardFaceElement.CardFaceElementId);

        public async Task<CardFaceElement> CreateAsync(CardFaceElement item)
        {
            // TODO: Set the last used date if the element's type if image to null
            return await _crudService.CreateAsync(item);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }

        public bool Exists(long id)
        {
            return _crudService.Exists(id);
        }

        public bool IsModified(CardFaceElement item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<CardFaceElement>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<CardFaceElement?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, CardFaceElement item)
        {
            // TODO: Set the last used date if the element's type if image to null

            return await _crudService.UpdateAsync(id, item);
        }

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
            
            // TODO: Set the last used date if the element's type if image to null

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

            /*if (cardFaceElement.CardFaceElementType == "Image" && cardFaceElement.CardFaceElementContent != null) {
                // TODO: Instead of deleting right here, we go to the file and set the last used date to now
                await _fileUploadService.DeleteCardFaceElementImageFileAsync(cardFaceElement.CardFaceElementContent);
            }*/

            _context.CardFaceElement.Remove(cardFaceElement);

            if (cardFaceElement.Style != null)
            {
                _context.Style.Remove(cardFaceElement.Style);
            }

            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public async Task<IEnumerable<CardFaceElement>> GetAllNavAsync()
        {
            var cardFaceElements = await _context.CardFaceElement
                .Include(element => element.Style)
                .ToListAsync();

            return cardFaceElements;
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
                throw new ArgumentException("Item: CardFaceElement Face Element\nFunction: Create Nav Async\nThe Style property of CardFaceElement cannot be null.", nameof(nav));
            }

            nav.Style.StyleId = Snowflake.NewId();
            nav.CardFaceElementId = Snowflake.NewId();

            nav.StyleId = 0; // Makes sure to override this

            // TODO: Set the last used date if the element's type if image to null
            
            await _context.CardFaceElement.AddAsync(nav);
            int changes = await _context.SaveChangesAsync();

            if (changes <= 0)
                throw new Exception("No changes were made");

            await _context.Entry(nav).Reference(e => e.Style).LoadAsync();

            return nav;
        }
    }
}