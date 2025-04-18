using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardPositionPerRoomService: ICrud<CardPositionPerRoom>, ICrudNav<CardPositionPerRoom>
    {
        // TODO: Grab every single item that is associated with that game room ID
        // ASSUMPTION: Loads when there's someone in the game room
        public Task<IEnumerable<CardPositionPerRoom>> GetAllNavByRoomIdAsync(int gameRoomId);

        public Task<CardPositionPerRoom?> GetNavByCardAndRoomIdAsync(int cardId, int gameRoomId);

        // https://www.owlbear.rodeo/
        // https://docs.owlbear.rodeo/extensions/getting-started/
        // https://github.com/orgs/owlbear-rodeo/repositories
    }
}