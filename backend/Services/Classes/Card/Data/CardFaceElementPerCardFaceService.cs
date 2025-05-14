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
using Algorithms;

namespace Services
{
    public class CardFaceElementPerCardFaceService(ApplicationDbContext context, ICardFaceService cardFaceService, IDndItemService dndItemService, IDndPositionService dndPositionService, ICardFaceElementService cardFaceElementService) : ICardFaceElementPerCardFaceService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICardFaceService _cardFaceService = cardFaceService;
        private readonly IDndItemService _dndItemService = dndItemService;
        private readonly IDndPositionService _dndPositionService = dndPositionService;
        private readonly ICardFaceElementService _cardFaceElementService = cardFaceElementService;
        private readonly CrudService<CardFaceElementPerCardFace> _crudService = new(context, c => c.CardFaceElementPerCardFaceId);

        public async Task<CardFaceElementPerCardFace> CreateAsync(CardFaceElementPerCardFace item)
        {
             return await _crudService.CreateAsync(item);
        }

        // NOTE: For bridge tables, create nav async should create the navigation properties serpately, then make them null afterwards, then just make the bridge table's new records
        public async Task<CardFaceElementPerCardFace> CreateNavAsync(CardFaceElementPerCardFace nav)
        {
            if (nav.CardFaceElement == null)
            {
                throw new ArgumentException("Item: Card Face Element Per Card Face\nFunction: Create Nav Async\nThe CardFaceElement property of CardFaceElementPerCardFace cannot be null.", nameof(nav));
            }

            if (_cardFaceElementService.Exists(nav.CardFaceElement.CardFaceElementId))
            {
                throw new ArgumentException("Item: Card Face Element\nFunction: Create Nav Async\nThe CardFaceElement property of CardFaceElementPerCardFace has already been made.", nameof(nav));
            }

            nav.CardFaceElement = await _cardFaceElementService.CreateNavAsync(nav.CardFaceElement);
            nav.CardFaceElementId = nav.CardFaceElement.CardFaceElementId;
            nav.CardFaceElement = null;

            if (nav.CardFace == null )
            {
                throw new ArgumentException("Item: Card Face Element Per Card Face\nFunction: Create Nav Async\nThe CardFace property of CardFaceElementPerCardFace cannot be null.", nameof(nav));
            }

            if (!_cardFaceService.Exists(nav.CardFace.CardFaceId))
            {
                throw new ArgumentException("Item: Card Face Element\nFunction: Create Nav Async\nThe CardFaceElement property of CardFaceElementPerCardFace should already be made since we're updating multiple card face elements per one card face.", nameof(nav));
            }

            nav.CardFaceId = nav.CardFace.CardFaceId;
            nav.CardFace = null;

            if (nav.DndItem == null )
            {
                throw new ArgumentException("Item: Card Face Element Per Card Face\nFunction: Create Nav Async\nThe DndItem property of CardFaceElementPerCardFace cannot be null.", nameof(nav));
            }

            if (_dndItemService.Exists(nav.DndItem.DndItemId))
            {
                throw new ArgumentException("Item: Card Face Element\nFunction: Create Nav Async\nThe DndItem property of CardFaceElementPerCardFace should not exist.", nameof(nav));
            }

            nav.DndItem = await _dndItemService.CreateAsync(nav.DndItem);
            nav.DndItemId = nav.DndItem.DndItemId;
            nav.DndItem = null;

            if (nav.DndPosition == null )
            {
                throw new ArgumentException("Item: Card Face Element Per Card Face\nFunction: Create Nav Async\nThe DndPosition property of CardFaceElementPerCardFace cannot be null.", nameof(nav));
            }

            if (_dndPositionService.Exists(nav.DndPosition.DndPositionId))
            {
                throw new ArgumentException("Item: Card Face Element\nFunction: Create Nav Async\nThe DndPosition property of CardFaceElementPerCardFace should not exist.", nameof(nav));
            }

            nav.DndPosition = await _dndPositionService.CreateAsync(nav.DndPosition);
            nav.DndPositionId = nav.DndPosition.DndPositionId;
            nav.DndPosition = null;

            nav.CardFaceElementPerCardFaceId = Snowflake.NewId();

            await _context.CardFaceElementPerCardFace.AddAsync(nav);
            int changes = await _context.SaveChangesAsync();

            if (changes <= 0)
                throw new Exception("No changes were made");

            // At this point, nav.CardFaceElementPerCardFaceId has the new ID
            // Reload navigation properties if needed
            await _context.Entry(nav).Reference(e => e.CardFaceElement).LoadAsync();
            // CHECKME: Would we need to load the style?
            // await _context.Entry(nav).Reference(e => e.CardFaceElement!.Style).LoadAsync();
            await _context.Entry(nav).Reference(e => e.CardFace).LoadAsync();
            await _context.Entry(nav).Reference(e => e.DndItem).LoadAsync();
            await _context.Entry(nav).Reference(e => e.DndPosition).LoadAsync();
            // await _context.Entry(nav).Reference(e => e.DndDragBoundary).LoadAsync(); // if needed

            return nav;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }

        // NOTE: Don't delete the card face because all card face element per card face might share the same card face
        public async Task<bool> DeleteNavAsync(long id)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    CardFaceElementPerCardFace? cardFaceElementPerCardFaceToDelete = await GetAsync(id);

                    if (cardFaceElementPerCardFaceToDelete == null)
                    {
                        return false;
                    }

                    bool deleted = await DeleteAsync(id);

                    if (!deleted)
                        throw new Exception("Card face element per card face wasn't deleted");

                    deleted = await _cardFaceElementService.DeleteNavAsync(cardFaceElementPerCardFaceToDelete.CardFaceElementId);
                    
                    if (!deleted)
                        throw new Exception("Card face element wasn't deleted");

                    deleted = await _dndItemService.DeleteAsync(cardFaceElementPerCardFaceToDelete.DndItemId);
                    
                    if (!deleted)
                        throw new Exception("Dnd item wasn't deleted");

                    deleted = await _dndPositionService.DeleteAsync(cardFaceElementPerCardFaceToDelete.DndPositionId);
                    
                    if (!deleted)
                        throw new Exception("Dnd position wasn't deleted");

                    await transaction.CommitAsync();
                    return true;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(ex.Message);
                    throw;
                }
            }
        }

        public bool Exists(long id)
        {
           return _crudService.Exists(id);
        }

        public async Task<IEnumerable<CardFaceElementPerCardFace>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<IEnumerable<CardFaceElementPerCardFace>> GetAllNavAsync()
        {
            var cfepcfs = await _context.CardFaceElementPerCardFace
                .Include(a => a.CardFaceElement)
                .Include(a => a.CardFace)
                .Include(a => a.DndItem)
                .Include(a => a.DndPosition)
                // .Include(a => a.DndDragBoundary)
                .ToListAsync();

            return cfepcfs;
        }

        public async Task<CardFaceElementPerCardFace?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<IEnumerable<CardFaceElementPerCardFace>> GetAllNavByCardFaceIdAsync(long cardFaceId)
        {
            var cfepcfs = await _context.CardFaceElementPerCardFace
                .Where(attribute => attribute.CardFaceId == cardFaceId)
                .Include(a => a.CardFaceElement)
                .Include(a => a.CardFaceElement!.Style)
                .Include(a => a.CardFace)
                .Include(a => a.DndItem)
                .Include(a => a.DndPosition)
                // .Include(a => a.DndDragBoundary)
                .ToListAsync();

            return cfepcfs;
        }

        public async Task<IEnumerable<CardFaceElementPerCardFace>> GetAllNavByCardFaceElementIdAndCardFaceIdAsync(long cardFaceElementId, long cardFaceId)
        {
            var cfepcfs = await _context.CardFaceElementPerCardFace
                .Where(attribute => attribute.CardFaceElementId == cardFaceElementId && attribute.CardFaceId == cardFaceId)
                .Include(a => a.CardFaceElement)
                .Include(a => a.CardFaceElement!.Style)
                .Include(a => a.CardFace)
                .Include(a => a.DndItem)
                .Include(a => a.DndPosition)
                // .Include(a => a.DndDragBoundary)
                .ToListAsync();

            return cfepcfs;
        }

        public async Task<CardFaceElementPerCardFace?> GetNavAsync(long id)
        {
            CardFaceElementPerCardFace? cfepcf = await _context.CardFaceElementPerCardFace
                .Include(a => a.CardFaceElement)
                .Include(a => a.CardFaceElement!.Style)
                .Include(a => a.CardFace)
                .Include(a => a.DndItem)
                .Include(a => a.DndPosition)
                // .Include(a => a.DndDragBoundary)
                .FirstOrDefaultAsync(cardFaceElementPerCardFace => cardFaceElementPerCardFace.CardFaceElementPerCardFaceId == id);

            return cfepcf;
        }

        public bool IsModified(CardFaceElementPerCardFace item)
        {
           return _crudService.IsModified(item);
        }

        public async Task<bool> UpdateAsync(long id, CardFaceElementPerCardFace item)
        {
           return await _crudService.UpdateAsync(id, item);
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
                await CreateNavAsync(cardFaceElementPerCardFace);
            }
        }

        public async Task CreateAllNavByCardFaceIdFromExistingAllNavAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace)
        {
            if (cardFace == null)
            {
                throw new ArgumentNullException(nameof(cardFace), "cardFace should not be null");
            }
            
            foreach (CardFaceElementPerCardFace cardFaceElementPerCardFace in cardFaceElementsPerCardFace) {
                await CreateNavByExistingCardFaceIdFromExistingNavAsync(cardFaceElementPerCardFace, cardFace);
            }
        }

        public async Task<CardFaceElementPerCardFace> CreateNavByExistingCardFaceIdFromExistingNavAsync(CardFaceElementPerCardFace cardFaceElementPerCardFace, CardFace cardFace)
        {
            if (cardFaceElementPerCardFace.CardFace == null 
                    || cardFaceElementPerCardFace.CardFaceElement == null 
                    || cardFaceElementPerCardFace.CardFaceElement.Style == null
                    || cardFaceElementPerCardFace.DndItem == null
                    || cardFaceElementPerCardFace.DndPosition == null)
                    {
                        throw new ArgumentNullException(nameof(cardFaceElementPerCardFace), "At least one navigational property of CardFaceElementPerCardFace is null");
                    }
                
                cardFaceElementPerCardFace.CardFace = cardFace;
                cardFaceElementPerCardFace.CardFaceElement.CardFaceElementId = 0;
                cardFaceElementPerCardFace.CardFaceElement.Style.StyleId = 0;
                cardFaceElementPerCardFace.DndItem.DndItemId =0;
                 cardFaceElementPerCardFace.DndPosition.DndPositionId = 0;

                // cardFaceElementPerCardFace.DndDragBoundaryId = 0;
                // cardFaceElementPerCardFace.DndDragBoundary.DndDragBoundaryId =0;
                
                return await CreateNavAsync(cardFaceElementPerCardFace);
        }


        public async Task<bool> UpdateAllNavByCardFaceAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace)
        {
            var updated = await _cardFaceService.UpdateNavAsync(cardFace);

            if (updated == false)
                return updated;
            
            foreach (var cardFaceElementPerCardFace in cardFaceElementsPerCardFace) 
            {
                cardFaceElementPerCardFace.CardFace = cardFace;

                // PURPOSE: It's because some elements might be newly added and have an ID of 0
                if (cardFaceElementPerCardFace.CardFaceElement != null && !_cardFaceElementService.Exists(cardFaceElementPerCardFace.CardFaceElement.CardFaceElementId)) {
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