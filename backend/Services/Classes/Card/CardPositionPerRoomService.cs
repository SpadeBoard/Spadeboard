using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;

namespace Services
{
    public class CardPositionPerRoomService(ApplicationDbContext context, ICardService cardService, IDndItemService dndItemService) : ICardPositionPerRoomService
    {
        private readonly ApplicationDbContext _context = context;

        private readonly ICardService _cardService = cardService;

        private readonly IDndItemService _dndItemService = dndItemService;

        public async Task<CardPositionPerRoom?> GetCardPositionPerRoomAsync(int cardPositionPerRoomId)
        {
            var cpr = await _context.CardPositionPerRoom.FirstOrDefaultAsync(cpr => cpr.CardPositionPerRoomId == cardPositionPerRoomId);

            return cpr;
        }

        public async Task<IEnumerable<CardPositionPerRoom>> GetCardsPositionPerRoomNavByRoomIdAsync(int gameRoomId)
        {
            var cprs = await _context.CardPositionPerRoom.Where(cpr => cpr.GameRoomId == gameRoomId).ToListAsync();

            foreach (CardPositionPerRoom cpr in cprs) {
                await GetCardPositionPerRoomNav(cpr);
            }

            return cprs;
        }

        public async Task GetCardPositionPerRoomNav(CardPositionPerRoom cpr) 
        {
            var card = await _cardService.GetAsync(cpr.CardId);

            if (card != null)
            {
                cpr.Card = card;
            }

            var dndItemDto = await _dndItemService.GetDndItemDtoByDndItemIdAndDndPositionIdAsync(cpr.DndItemId, cpr.DndPositionId);

            if (dndItemDto != null)
            {
                cpr.DndItem = dndItemDto.DndItem;
                cpr.DndPosition = dndItemDto.DndPosition;
            }

            // TODO: Refactor and make a service for game room
            var gameRoom = await _context.GameRoom.FirstOrDefaultAsync(gr => gr.GameRoomId == cpr.GameRoomId);
            if (gameRoom != null)
            {
                cpr.GameRoom = gameRoom;
            }
        }

        public async Task<CardPositionPerRoom?> GetCardPositionPerRoomNavByCardAndRoomIdAsync(int cardId, int gameRoomId)
        {
            var cpr = await _context.CardPositionPerRoom.FirstOrDefaultAsync(cpr => cpr.CardId == cardId && cpr.GameRoomId == gameRoomId);

            if (cpr == null)
            {
                return null;
            }

            await GetCardPositionPerRoomNav(cpr);

            return cpr;
        }

        public async Task CreateCardPositionPerRoomAsync(CardPositionPerRoom cardPositionPerRoom)
        {
            // TODO: Navigation property wise, if the IDs return null objects, then create them too
            
            await _context.CardPositionPerRoom.AddAsync(cardPositionPerRoom);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCardPositionPerRoomAsync(CardPositionPerRoom cardPositionPerRoom)
        {
            throw new NotImplementedException();
        }

        public async Task DeleteCardPositiionPerRoomAsync(int id)
        {
            throw new NotImplementedException();
        }

        public bool Exists(int id)
        {
            return  _context.CardPositionPerRoom.Any(e => e.CardPositionPerRoomId == id);
        }
    }
}