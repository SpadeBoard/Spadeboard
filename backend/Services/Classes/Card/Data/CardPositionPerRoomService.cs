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

        private readonly CrudService<CardPositionPerRoom> _crudService = new(context, cpr => cpr.CardPositionPerRoomId);

        public async Task<CardPositionPerRoom> CreateAsync(CardPositionPerRoom item)
        {
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

        public bool IsModified(CardPositionPerRoom item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<CardPositionPerRoom>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<CardPositionPerRoom?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, CardPositionPerRoom item)
        {
            return await _crudService.UpdateAsync(id, item);
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

        public async Task<CardPositionPerRoom?> GetByCardIdAsync(long cardId) {
            return await _context.CardPositionPerRoom.FirstOrDefaultAsync(c => c.CardId == cardId);
        }

        // NOTE: Don't delete the game room because it has a many relationship
        public async Task<bool> DeleteNavAsync(long id)
        {
            try
            {
                CardPositionPerRoom? cardPositionPerRoom = await GetAsync(id);

                if (cardPositionPerRoom == null)
                {
                    return false;
                }

                bool deleted = await DeleteAsync(id);

                if (!deleted)
                    throw new Exception("Card position per room wasn't deleted");

                deleted = await _cardService.DeleteAsync(cardPositionPerRoom.CardId);

                if (!deleted)
                    throw new Exception("Card wasn't deleted");

                deleted = await _dndItemService.DeleteAsync(cardPositionPerRoom.DndItemId);

                if (!deleted)
                    throw new Exception("Dnd item wasn't deleted");

                deleted = await _dndPositionService.DeleteAsync(cardPositionPerRoom.DndPositionId);

                if (!deleted)
                    throw new Exception("Dnd position wasn't deleted");

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }
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
    }
}