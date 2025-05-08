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
using System.Net;

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
            CardFaceElementPerCardFace? cardFaceElementPerCardFaceToDelete = await GetAsync(id);

            if (cardFaceElementPerCardFaceToDelete == null) {
                return false;
            }

            bool deleted = await DeleteAsync(id);

            if (!deleted)
                return deleted;

            deleted = await _cardFaceElementService.DeleteNavAsync(cardFaceElementPerCardFaceToDelete.CardFaceElementId);

            if (!deleted)
                return deleted;

            deleted = await _dndItemService.DeleteAsync(cardFaceElementPerCardFaceToDelete.DndItemId);
            
            if (!deleted)
                return deleted;

            deleted = await _dndPositionService.DeleteAsync(cardFaceElementPerCardFaceToDelete.DndPositionId);

            if (!deleted)
                return deleted;

            return deleted;

            // NOTE: Don't delete the card face because all card face element per card face might share teh same card face
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

        // TODO: Write documentation on how updating bridge tables should work
        public async Task<bool> UpdateNavAsync(CardFaceElementPerCardFace nav)
        {
            try
            {
                bool updated = false;

                if (nav.CardFaceElement != null /*&& _cardFaceElementService.IsModified(nav.CardFaceElement)*/)
                {
                    updated = await _cardFaceElementService.UpdateNavAsync(nav.CardFaceElement);
                }

                if (nav.DndItem != null /*&& _dndItemService.IsModified(nav.DndItem)*/)
                {
                    updated = await _dndItemService.UpdateAsync(nav.DndItemId, nav.DndItem);
                }

                /*
                    Detail: Key (DndPositionId)=(0) is not present in table "DndPositions".
                    SchemaName: public
                    TableName: CardFaceElementPerCardFace
                    ConstraintName: FK_CardFaceElementPerCardFace_DndPositions_DndPositionId
                    File: ri_triggers.c
                    Line: 2599
                    Routine: ri_ReportViolation
                */
                if (nav.DndPosition != null /*&& _dndPositionService.IsModified(nav.DndPosition)*/)
                {
                   updated = await _dndPositionService.UpdateAsync(nav.DndPositionId, nav.DndPosition);
                }

                /*if (nav.DndDragBoundary != null && _dndDragBoundaryService.IsModified(nav.DndDragBoundary))
                {
                    _context.Entry(nav.DndDragBoundary).State = EntityState.Modified;
                }*/

                if (nav.CardFace != null /*&& _cardFaceService.IsModified(nav.CardFace)*/)
                {
                   updated = await _cardFaceService.UpdateNavAsync(nav.CardFace);
                }

                //  _context.Entry(nav).State = EntityState.Modified;

                return updated;
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

                if (cardFaceElementPerCardFace.CardFaceElement != null) {
                    await _cardFaceElementService.CreateNavAsync(cardFaceElementPerCardFace.CardFaceElement);
                }

                await CreateNavAsync(cardFaceElementPerCardFace);
            }
        }

        public async Task CreateAllNavByCardFaceIdFromExistingAllNavAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace)
        {
            foreach (CardFaceElementPerCardFace cardFaceElementPerCardFace in cardFaceElementsPerCardFace) {
                // TODO: Put this in a separate utility function somewhere
                cardFaceElementPerCardFace.CardFace = cardFace;
                
                cardFaceElementPerCardFace.CardFaceElementId = 0;
                
                if (cardFaceElementPerCardFace.CardFaceElement != null) {
                    cardFaceElementPerCardFace.CardFaceElement.CardFaceElementId = 0;
                    cardFaceElementPerCardFace.CardFaceElement.StyleId = 0;

                    if (cardFaceElementPerCardFace.CardFaceElement.Style != null) {
                        cardFaceElementPerCardFace.CardFaceElement.Style.StyleId = 0;
                    }

                    await _cardFaceElementService.CreateNavAsync(cardFaceElementPerCardFace.CardFaceElement);
                }

                cardFaceElementPerCardFace.DndItemId = 0;

                if (cardFaceElementPerCardFace.DndItem != null) {
                     cardFaceElementPerCardFace.DndItem.DndItemId =0;
                }

                cardFaceElementPerCardFace.DndPositionId = 0;

                if (cardFaceElementPerCardFace.DndPosition != null) {
                    cardFaceElementPerCardFace.DndPosition.DndPositionId = 0;
                }

                // cardFaceElementPerCardFace.DndDragBoundaryId = 0;
                // cardFaceElementPerCardFace.DndDragBoundary.DndDragBoundaryId =0;
                await CreateNavAsync(cardFaceElementPerCardFace);
            }
        }


        public async Task<bool> UpdateAllNavByCardFaceIdAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace)
        {
            var updated = await _cardFaceService.UpdateNavAsync(cardFace);

            if (updated == false)
                return updated;
            
            foreach (var cardFaceElementPerCardFace in cardFaceElementsPerCardFace) 
            {
                cardFaceElementPerCardFace.CardFace = cardFace;

                // PURPOSE: It's because some elements might be newly added and have an ID of 0
                if (cardFaceElementPerCardFace.CardFaceElement != null && !_cardFaceElementService.Exists(cardFaceElementPerCardFace.CardFaceElement.CardFaceElementId)) {
                    await _cardFaceElementService.CreateNavAsync(cardFaceElementPerCardFace.CardFaceElement);
                    await CreateNavAsync(cardFaceElementPerCardFace);
                    
                    Console.WriteLine("Create nav async for element in update all nav by card face ID");

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