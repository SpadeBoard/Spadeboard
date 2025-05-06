using Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Newtonsoft.Json;

namespace Services
{
    public class CardFaceElementPerCardFaceService(ApplicationDbContext context, ICardFaceService cardFaceService, IDndItemService dndItemService, IDndPositionService dndPositionService, ICardFaceElementService cardFaceElementService) : ICardFaceElementPerCardFaceService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICardFaceService _cardFaceService = cardFaceService;
        private readonly IDndItemService _dndItemService = dndItemService;
        private readonly IDndPositionService _dndPositionService = dndPositionService;
        private readonly ICardFaceElementService _cardFaceElementService = cardFaceElementService;

        public async Task CreateAsync(CardFaceElementPerCardFace item)
        {
            _context.CardFaceElementPerCardFace.Add(item);
            await _context.SaveChangesAsync();
        }

        // TODO: Have CardEditorCardFaceDto call CreateAllNavAsync
        public async Task CreateNavAsync(CardFaceElementPerCardFace nav)
        {
            if (nav.CardFaceElement != null && _cardFaceElementService.Exists(nav.CardFaceElement.CardFaceElementId))
            {
                // FIXME: Add this first separately
                // TODO: Really these checks should be in a utility function
                nav.CardFaceElementId = nav.CardFaceElement.CardFaceElementId;
                nav.CardFaceElement = null;
            }
            else if (nav.CardFaceElement != null)
            {
                nav.CardFaceElement.CardFaceElementId = 0;
            }

            if (nav.CardFace != null && _cardFaceService.Exists(nav.CardFace.CardFaceId))
            {
                nav.CardFaceId = nav.CardFace.CardFaceId;
                nav.CardFace = null;
            }
            else if (nav.CardFace != null)
            {
                nav.CardFace.CardFaceId = 0;
            }

            if (nav.DndItem != null && _dndItemService.Exists(nav.DndItem.DndItemId))
            {
                nav.DndItemId = nav.DndItem.DndItemId;
                nav.DndItem = null;
            }
            else if (nav.DndItem != null)
            {
                nav.DndItem.DndItemId = 0;
            }

            if (nav.DndPosition != null && _dndPositionService.Exists(nav.DndPosition.DndPositionId))
            {
                nav.DndPositionId = nav.DndPosition.DndPositionId;
                nav.DndPosition = null;
            }
            else if (nav.DndPosition != null)
            {
                nav.DndPosition.DndPositionId = 0;
            }

            nav.CardFaceElementPerCardFaceId = 0;
            
            await _context.CardFaceElementPerCardFace.AddAsync(nav);
            int changes = await _context.SaveChangesAsync();

            if (changes <= 0)
                throw new Exception("No changes were made");

            var e = await _context.CardFaceElementPerCardFace
                .Include(e=> e.CardFaceElement)
                .Include(e => e.CardFace)
                .Include(e => e.DndItem)
                .Include(e => e.DndPosition)
                // .Include(e=> e.DndDragBoundary)
                .FirstOrDefaultAsync(e=> e.CardFaceElementPerCardFaceId == nav.CardFaceElementPerCardFaceId);

            if (e != null)
            {
                nav = e;
                Console.WriteLine("\nCard Face Element Per Card Face Service - Create Nav Async: {0}\n",  JsonConvert.SerializeObject(nav));
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var cardFaceElementPerCardFace= await GetAsync(id);
            if (cardFaceElementPerCardFace== null)
            {
                return false;
            }

            _context.CardFaceElementPerCardFace.Remove(cardFaceElementPerCardFace);
            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public async Task<bool> DeleteNavAsync(int id)
        {
            throw new NotImplementedException();
        }

        public bool Exists(int id)
        {
            return _context.CardFaceElementPerCardFace.Any(e => e.CardFaceElementPerCardFaceId == id);
        }

        public async Task<IEnumerable<CardFaceElementPerCardFace>> GetAllAsync()
        {
            return await _context.CardFaceElementPerCardFace.ToListAsync();
        }

        public async Task<IEnumerable<CardFaceElementPerCardFace>> GetAllNavAsync()
        {
            var cfepcfs = await _context.CardFaceElementPerCardFace
                .Include(a => a.CardFaceElement)
                .Include(a => a.CardFace)
                .Include(a => a.DndItem)
                .Include(a => a.DndPosition)
                .Include(a => a.DndDragBoundary)
                .ToListAsync();

            return cfepcfs;
        }

        public async Task<CardFaceElementPerCardFace?> GetAsync(int id)
        {
            return await _context.CardFaceElementPerCardFace.FindAsync(id);
        }

        public async Task<IEnumerable<CardFaceElementPerCardFace>> GetAllNavByCardFaceIdAsync(int cardFaceId)
        {
            var cfepcfs = await _context.CardFaceElementPerCardFace
                .Where(attribute => attribute.CardFaceId == cardFaceId)
                .Include(a => a.CardFaceElement)
                .Include(a => a.CardFaceElement.Style)
                .Include(a => a.CardFace)
                .Include(a => a.DndItem)
                .Include(a => a.DndPosition)
                .Include(a => a.DndDragBoundary)
                .ToListAsync();

            return cfepcfs;
        }

        public async Task<IEnumerable<CardFaceElementPerCardFace>> GetAllNavByCardFaceElementIdAndCardFaceIdAsync(int cardFaceElementId, int cardFaceId)
        {
            var cfepcfs = await _context.CardFaceElementPerCardFace
                .Where(attribute => attribute.CardFaceElementId == cardFaceElementId && attribute.CardFaceId == cardFaceId)
                .Include(a => a.CardFaceElement)
                .Include(a => a.CardFace)
                .Include(a => a.DndItem)
                .Include(a => a.DndPosition)
                .Include(a => a.DndDragBoundary)
                .ToListAsync();

            return cfepcfs;
        }

        public async Task<CardFaceElementPerCardFace?> GetNavAsync(int id)
        {
            CardFaceElementPerCardFace? cfepcf = await _context.CardFaceElementPerCardFace
                .Include(a => a.CardFaceElement)
                .Include(a => a.CardFace)
                .Include(a => a.DndItem)
                .Include(a => a.DndPosition)
                .Include(a => a.DndDragBoundary)
                .FirstOrDefaultAsync(cardFaceElementPerCardFace => cardFaceElementPerCardFace.CardFaceElementPerCardFaceId == id);

            return cfepcf;
        }

        public bool IsModified(CardFaceElementPerCardFace item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }

        public async Task<bool> UpdateAsync(int id, CardFaceElementPerCardFace item)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateNavAsync(CardFaceElementPerCardFace nav)
        {
            if (nav.CardFaceElement != null && _cardFaceElementService.IsModified(nav.CardFaceElement))
            {
                _context.Entry(nav.CardFaceElement).State = EntityState.Modified;
            }

            if (nav.DndItem != null && _dndItemService.IsModified(nav.DndItem))
            {
                _context.Entry(nav.DndItem).State = EntityState.Modified;
            }

            if (nav.DndPosition != null && _dndPositionService.IsModified(nav.DndPosition))
            {
                _context.Entry(nav.DndPosition).State = EntityState.Modified;
            }

            /*if (nav.DndDragBoundary != null && _dndDragBoundaryService.IsModified(nav.DndDragBoundary))
            {
                _context.Entry(nav.DndDragBoundary).State = EntityState.Modified;
            }*/

            if (nav.CardFace != null && _cardFaceService.IsModified(nav.CardFace))
            {
                _context.Entry(nav.CardFace).State = EntityState.Modified;
            }

            _context.Entry(nav).State = EntityState.Modified;

            try
            {
                return await _context.SaveChangesAsync() > 0;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(nav.CardFaceElementPerCardFaceId))
                {
                    return false;
                }
                else
                {
                    throw;
                }
            }
        }

        public async Task CreateAllNavByCardFaceIdAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace)
        {
            foreach (CardFaceElementPerCardFace cardFaceElementPerCardFace in cardFaceElementsPerCardFace) {
                cardFaceElementPerCardFace.CardFace = cardFace;
                await _cardFaceElementService.CreateNavAsync(cardFaceElementPerCardFace.CardFaceElement);

                await CreateNavAsync(cardFaceElementPerCardFace);
            }
        }

        public async Task CreateAllNavByCardFaceIdFromExistingAllNavAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace)
        {
            foreach (CardFaceElementPerCardFace cardFaceElementPerCardFace in cardFaceElementsPerCardFace) {
                // TODO: Put this in a separate utility function somewhere
                cardFaceElementPerCardFace.CardFace = cardFace;
                
                cardFaceElementPerCardFace.CardFaceElementId = 0;
                cardFaceElementPerCardFace.CardFaceElement.CardFaceElementId = 0;
                
                cardFaceElementPerCardFace.CardFaceElement.StyleId = 0;
                cardFaceElementPerCardFace.CardFaceElement.Style.StyleId = 0;

                cardFaceElementPerCardFace.DndItemId = 0;
                cardFaceElementPerCardFace.DndItem.DndItemId =0;

                cardFaceElementPerCardFace.DndPositionId = 0;
                cardFaceElementPerCardFace.DndPosition.DndPositionId = 0;

                // cardFaceElementPerCardFace.DndDragBoundaryId = 0;
                // cardFaceElementPerCardFace.DndDragBoundary.DndDragBoundaryId =0;

                await _cardFaceElementService.CreateNavAsync(cardFaceElementPerCardFace.CardFaceElement);
                await CreateNavAsync(cardFaceElementPerCardFace);
            }
        }


        public async Task<bool> UpdateAllNavByCardFaceIdAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace)
        {
            var updated = await _cardFaceService.UpdateNavAsync(cardFace);

            if (updated == false)
                return updated;
            
            // PURPOSE: It's because some elements might be newly added and have an ID of 0
            foreach (var cardFaceElementPerCardFace in cardFaceElementsPerCardFace) 
            {
                cardFaceElementPerCardFace.CardFace = cardFace;

                if (!_cardFaceElementService.Exists(cardFaceElementPerCardFace.CardFaceElement.CardFaceElementId)) {
                    await _cardFaceElementService.CreateNavAsync(cardFaceElementPerCardFace.CardFaceElement);
                    await CreateNavAsync(cardFaceElementPerCardFace);
                    
                    continue;
                }

                updated = await UpdateNavAsync(cardFaceElementPerCardFace);

                if (updated == false)
                    return updated;
            }

            return updated;
        }
    }
}