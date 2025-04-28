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
    public class CardFaceElementService(ApplicationDbContext context,  ICardFaceService cardFaceService, IDndItemService dndItemService, IStyleService styleService) : ICardFaceElementService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICardFaceService _cardFaceService = cardFaceService;
        private readonly IDndItemService _dndItemService = dndItemService;
        private readonly IStyleService _styleService = styleService;

        public async Task<IEnumerable<CardFaceElement>> GetAllByCardFaceIdAsync(int cardFaceId)
        {
            return await _context.CardFaceElement
                .Where(element => element.CardFaceId == cardFaceId)
                .ToListAsync();
        }

        public async Task CreateAllNavCardFaceAsync(CardFaceElement[] cardFaceElements, CardFace cardFace)
        {
            foreach (CardFaceElement e in cardFaceElements)
            {
                e.CardFace = cardFace;

                await CreateNavAsync(e);
            }
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
            if (cardFaceElement.Style != null && _styleService.IsModified(cardFaceElement.Style))
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

        public bool IsModified(CardFaceElement item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
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

        public async Task CreateNavAsync(CardFaceElement nav)
        {
            // TODO: Make a style service, and use Exists as a check
            if (nav.Style != null && _styleService.Exists(nav.Style.StyleId))
            {
                nav.StyleId = nav.Style.StyleId;
                nav.Style = null;
            }
            else if (nav.Style != null)
            {
                nav.Style.StyleId = 0;
            }

            // TODO: Refactor the thing so that 1 card face element can be on multiple faces
            /*if (nav.CardFace != null && _cardFaceService.Exists(nav.CardFace.CardFaceId))
            {
                nav.CardFace.CardFaceId = nav.CardFace.CardFaceId;
                nav.CardFace = null;
            }
            else if (nav.CardFace != null)
            {
                nav.CardFace.CardFaceId = 0;
            }*/

            nav.CardFaceElementId = 0;
            
            await _context.CardFaceElement.AddAsync(nav);
            int changes = await _context.SaveChangesAsync();

            if (changes <= 0)
                throw new Exception("No changes were made");

            var e = await _context.CardFaceElement
                .Include(e=> e.Style)
                .Include(e => e.CardFace)
                .FirstOrDefaultAsync(e=> e.CardFaceElementId == nav.CardFaceElementId);

            if (e != null)
            {
                nav = e;
            }
        }
    }
}