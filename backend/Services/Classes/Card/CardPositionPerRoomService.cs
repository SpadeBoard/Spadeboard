using System.Text.Json;
using Data;
using Microsoft.EntityFrameworkCore;
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

        public async Task<CardPositionPerRoom?> GetAsync(int id)
        {
            var cpr = await _context.CardPositionPerRoom.FirstOrDefaultAsync(cpr => cpr.CardPositionPerRoomId == id);

            return cpr;
        }

        public async Task<IEnumerable<CardPositionPerRoom>> GetAllNavByRoomIdAsync(int gameRoomId)
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

        public async Task<CardPositionPerRoom?> GetNavAsync(int id)  
        {
            var cpr = await _context.CardPositionPerRoom
            .Include(cpr => cpr.Card)
            .Include(cpr => cpr.DndItem)
            .Include(cpr => cpr.DndPosition)
            .Include(cpr => cpr.GameRoom)
            .FirstOrDefaultAsync(cpr => cpr.CardPositionPerRoomId == id);

            return cpr;
        }

        public async Task<CardPositionPerRoom?> GetNavByCardAndRoomIdAsync(int cardId, int gameRoomId)
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

        public async Task<bool> UpdateAsync(int id, CardPositionPerRoom item)
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

        public async Task<bool> DeleteAsync(int id)
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

        public bool Exists(int id)
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
        // Navigation properties of the properties aren't being passed in
        public async Task CreateNavAsync(CardPositionPerRoom nav)
        {
            if (nav.Card != null && _cardService.Exists(nav.Card.CardId))
            {
                nav.CardId = nav.Card.CardId;
                nav.Card = null;
            }

            if (nav.DndItem != null && _dndItemService.Exists(nav.DndItem.DndItemId)) 
            {
                nav.DndItemId = nav.DndItem.DndItemId;
                nav.DndItem = null;
            }

            if (nav.DndPosition != null && _dndPositionService.Exists(nav.DndPosition.DndPositionId))
            {
                nav.DndPositionId = nav.DndPosition.DndPositionId;
                nav.DndPosition = null;
            }

            if (nav.GameRoom != null && _gameRoomService.Exists(nav.GameRoom.GameRoomId)) {
                nav.GameRoomId = nav.GameRoom.GameRoomId;
                nav.GameRoom = null;
            }

            await _context.CardPositionPerRoom.AddAsync(nav);
            int changes = await _context.SaveChangesAsync();

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
        public Task UpdateNavAsync(CardPositionPerRoom nav)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteNavAsync(CardPositionPerRoom nav)
        {
            throw new NotImplementedException();
        }
    }
}