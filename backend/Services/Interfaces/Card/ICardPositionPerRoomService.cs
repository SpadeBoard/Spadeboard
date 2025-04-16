using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardPositionPerRoomService 
    {
        Task<CardPositionPerRoom?> GetCardPositionPerRoomAsync(int cardPositionPerRoomId);

        // TODO: Grab every single item that is associated with that game room ID
        // ASSUMPTION: Loads when there's someone in the game room
        public Task<IEnumerable<CardPositionPerRoom>> GetCardsPositionPerRoomNavByRoomIdAsync(int gameRoomId);

        public Task<CardPositionPerRoom?> GetCardPositionPerRoomNavByCardAndRoomIdAsync(int cardId, int gameRoomId);
        
        public Task GetCardPositionPerRoomNav(CardPositionPerRoom cpr) ;

        public Task CreateCardPositionPerRoomAsync(CardPositionPerRoom cardPositionPerRoom);

        // https://www.owlbear.rodeo/
        // https://docs.owlbear.rodeo/extensions/getting-started/
        // https://github.com/orgs/owlbear-rodeo/repositories
        public Task UpdateCardPositionPerRoomAsync(CardPositionPerRoom cardPositionPerRoom);

        public Task DeleteCardPositiionPerRoomAsync(int id);

        // TODO: Refactor the card DTO functions
        bool Exists(int id);
    }
}