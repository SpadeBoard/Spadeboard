using System.Text.Json;
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

        public async Task CreateAsync(CardPositionPerRoom item)
        {
            // TODO: Navigation property wise, if the IDs return null objects, then create them too
            item.CardPositionPerRoomId = 0;
            await _context.CardPositionPerRoom.AddAsync(item);
            await _context.SaveChangesAsync();
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

        // ASSUMPTION: Navigation properties of the properties aren't being passed in
        public async Task CreateNavAsync(CardPositionPerRoom nav)
        {
            if (nav.Card != null && _cardService.Exists(nav.Card.CardId))
            {
                nav.CardId = nav.Card.CardId;
                nav.Card = null;
            }
            else if (nav.Card != null)
            {
                nav.Card.CardId = 0;
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

            if (nav.GameRoom != null && _gameRoomService.Exists(nav.GameRoom.GameRoomId)) {
                nav.GameRoomId = nav.GameRoom.GameRoomId;
                nav.GameRoom = null;
            }
            else if (nav.GameRoom != null)
            {
                nav.GameRoom.GameRoomId = 0;
            }

            // Do we need to set all the Ids as 0?

            await _context.CardPositionPerRoom.AddAsync(nav);
            long changes = await _context.SaveChangesAsync();

            if (changes <= 0)
                throw new Exception("No changes were made");
            
            var cpr = await _context.CardPositionPerRoom
                .Include(cpr => cpr.Card)
                .Include(cpr => cpr.DndItem)
                .Include(cpr => cpr.GameRoom)
                .Include(cpr => cpr.DndPosition)
                .FirstOrDefaultAsync(cpr => cpr.CardPositionPerRoomId == nav.CardPositionPerRoomId);
            
            if (cpr != null) {
                nav = cpr;
            }
        }

        // TODO: Figure out whether UpdateNavAsync would return a boolean
        public async Task<bool> UpdateNavAsync(CardPositionPerRoom nav)
        {
            try
            {
                // FIXME: All IsModified is not going to work due to how it actually works
                if (nav.Card != null /*&& _cardService.IsModified(nav.Card)*/)
                {
                    await _cardService.UpdateAsync(nav.CardId, nav.Card);
                    Console.WriteLine("CPR Card modified");
                }

                if (nav.DndItem != null /*&& !_dndItemService.IsModified(nav.DndItem)*/)
                {
                    await _dndItemService.UpdateAsync(nav.DndItemId, nav.DndItem);
                    Console.WriteLine("CPR Dnd Item modified");
                }

                if (nav.DndPosition != null /*&& !_dndPositionService.IsModified(nav.DndPosition)*/)
                {
                    await _dndPositionService.UpdateAsync(nav.DndPositionId, nav.DndPosition);
                    Console.WriteLine("CPR Dnd Position modified");
                }

                // ASSUMPTION: We're updating all at once for the same room, 
                /*
                {
                    "message": "An error occurred while processing the request",
                    "error": "The instance of entity type 'GameRoom' cannot be tracked because another instance with the same key value for {'GameRoomId'} is already being tracked. When attaching existing entities, ensure that only one entity instance with a given key value is attached. Consider using 'DbContextOptionsBuilder.EnableSensitiveDataLogging' to see the conflicting key values."
                }
                */
                /*if (nav.GameRoom != null  && !_gameRoomService.IsModified(nav.GameRoom))
                {
                    await _gameRoomService.UpdateAsync(nav.GameRoomId, nav.GameRoom);
                }*/

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