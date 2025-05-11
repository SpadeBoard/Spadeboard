using System.Text.Json;
using Algorithms;
using Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Models.Bridge;

namespace Services
{
    public class CardPositionPerRoomService(ApplicationDbContext context, IGameRoomService gameRoomService, ICardService cardService, IDndItemService dndItemService, IDndPositionService dndPositionService) : ICardPositionPerRoomService
    {
        private readonly ApplicationDbContext _context = context;

        private readonly ICardService _cardService = cardService;

        private readonly IDndItemService _dndItemService = dndItemService;

        private readonly IDndPositionService _dndPositionService = dndPositionService;

        private readonly IGameRoomService _gameRoomService = gameRoomService;

        public async Task<CardPositionPerRoom?> GetAsync(long id)
        {
            return await _context.CardPositionPerRoom.FirstOrDefaultAsync(cpr => cpr.CardPositionPerRoomId == id);
        }

        public async Task<IEnumerable<CardPositionPerRoom>> GetAllNavByRoomIdAsync(long gameRoomId)
        {
            var cprs = await _context.CardPositionPerRoom
                .Include(cpr => cpr.Card)
                .Include(cpr => cpr.DndItem)
                .Include(cpr => cpr.DndPosition)
                .Include(cpr => cpr.GameRoom)
                .Where(cpr => cpr.GameRoomId == gameRoomId)
                .ToListAsync();

            return cprs;
        }

        public async Task<CardPositionPerRoom?> GetNavAsync(long id)  
        {
            var cpr = await _context.CardPositionPerRoom
            .Include(cpr => cpr.Card)
            .Include(cpr => cpr.DndItem)
            .Include(cpr => cpr.DndPosition)
            .Include(cpr => cpr.GameRoom)
            .FirstOrDefaultAsync(cpr => cpr.CardPositionPerRoomId == id);

            return cpr;
        }

        public async Task<CardPositionPerRoom?> GetNavByCardAndRoomIdAsync(long cardId, long gameRoomId)
        {
            var cpr = await _context.CardPositionPerRoom
                .Include(cpr => cpr.Card)
                .Include(cpr => cpr.DndItem)
                .Include(cpr => cpr.DndPosition)
                .Include(cpr => cpr.GameRoom)
                .FirstOrDefaultAsync(cpr => cpr.CardId == cardId && cpr.GameRoomId == gameRoomId);

            return cpr;
        }

        public async Task<CardPositionPerRoom> CreateAsync(CardPositionPerRoom item)
        {
            // TODO: Navigation property wise, if the IDs return null objects, then create them too
            item.CardPositionPerRoomId = 0;
            await _context.CardPositionPerRoom.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> UpdateAsync(long id, CardPositionPerRoom item)
        {
            if (id != item.CardPositionPerRoomId)
            {
                return false;
            }

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
            var cpr = await GetAsync(id);
            if (cpr == null)
            {
                return false;
            }

            _context.CardPositionPerRoom.Remove(cpr);
            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public bool Exists(long id)
        {
            return  _context.CardPositionPerRoom.Any(e => e.CardPositionPerRoomId == id);
        }

        public async Task<IEnumerable<CardPositionPerRoom>> GetAllAsync()
        {
            var cprs = await _context.CardPositionPerRoom.ToListAsync();

            return cprs;
        }

        public async Task<IEnumerable<CardPositionPerRoom>> GetAllNavAsync()
        {
            var cprs = await _context.CardPositionPerRoom
                .Include(cpr => cpr.Card)
                .Include(cpr => cpr.DndItem)
                .Include(cpr => cpr.DndPosition)
                .Include(cpr => cpr.GameRoom)
                .ToListAsync();

            return cprs;
        }

        // ASSUMPTION:
        // For the nav async, assume that the card was already made
        // Also assume that the room was already made

        // ASSUMPTION: Navigation properties of the properties aren't being passed in
        public async Task<CardPositionPerRoom> CreateNavAsync(CardPositionPerRoom nav)
        {
            if (nav.Card == null || !_cardService.Exists(nav.Card.CardId))
            {
                throw new ArgumentException("Card Position Per Room\nCreate Nav Async: Card cannot be null and must already exist.", nameof(nav));
            }

            nav.CardId = nav.Card.CardId;
            nav.Card = null;

            if (nav.GameRoom == null || !_gameRoomService.Exists(nav.GameRoom.GameRoomId))
            {
                throw new ArgumentException("Card Position Per Room\nCreate Nav Async: Game room cannot be null and must already exist.", nameof(nav));
            }

            nav.GameRoomId = nav.GameRoom.GameRoomId;
            nav.GameRoom = null;

            if (nav.DndItem == null || _dndItemService.Exists(nav.DndItem.DndItemId))
            {
                throw new ArgumentException("Card Position Per Room\nCreate Nav Async: DndItem cannot be null and must not already exist.", nameof(nav));
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

            nav.CardPositionPerRoomId = Snowflake.NewId();
            await _context.CardPositionPerRoom.AddAsync(nav);
            int changes = await _context.SaveChangesAsync();

            if (changes <= 0)
                throw new Exception("No changes were made");

            // Load navigation properties on the tracked entity (nav)
            await _context.Entry(nav).Reference(e => e.Card).LoadAsync();
            await _context.Entry(nav).Reference(e => e.DndItem).LoadAsync();
            await _context.Entry(nav).Reference(e => e.GameRoom).LoadAsync();
            await _context.Entry(nav).Reference(e => e.DndPosition).LoadAsync();

            return nav;
        }

        // ASSUMPTION: We're updating all at once for the same room
        public async Task<bool> UpdateNavAsync(CardPositionPerRoom nav)
        {
            try
            {
                if (nav.Card == null || nav.DndItem == null || nav.DndPosition == null)
                {
                    throw new ArgumentNullException(nameof(nav), "Card Position Per Room - Update nav async: At least one navigational property is null");
                }

                bool updated = true;

                updated = await _cardService.UpdateAsync(nav.CardId, nav.Card);
                
                /*if (!updated)
                {
                    return updated;
                }*/

                updated =  await _dndItemService.UpdateAsync(nav.DndItemId, nav.DndItem);

                /*if (!updated)
                {
                    return updated;
                }*/

                updated =  await _dndPositionService.UpdateAsync(nav.DndPositionId, nav.DndPosition);

                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(nav.CardPositionPerRoomId))
                {
                    throw;
                }
                else
                {
                    throw;
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        public Task<bool> DeleteNavAsync(long id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateAllNavAsync(CardPositionPerRoom[] cprs)
        {
            try
            {
                foreach (CardPositionPerRoom cpr in cprs)
                {
                    var updated = await UpdateNavAsync(cpr);

                    if (!updated) {
                        return false;
                    }
                }

                return true;
            }
            catch (Exception) 
            {
                throw;
            }
        }

        public bool IsModified(CardPositionPerRoom item)
        {
            throw new NotImplementedException();
        }
    }
}