using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardPositionPerRoomService: ICrud<CardPositionPerRoom>, ICrudNav<CardPositionPerRoom>
    {
        // TODO: Grab every single item that is associated with that game room ID
        // ASSUMPTION: Loads when there's someone in the game room
        public Task<IEnumerable<CardPositionPerRoom>> GetAllNavByRoomIdAsync(long gameRoomId);

        public Task<CardPositionPerRoom?> GetNavByCardAndRoomIdAsync(long cardId, long gameRoomId);

        public Task<bool> UpdateAllNavAsync(CardPositionPerRoom[] cprs);

        public Task<CardPositionPerRoom?> GetByCardIdAsync(long cardId);
        // https://www.owlbear.rodeo/
        // https://docs.owlbear.rodeo/extensions/getting-started/
        // https://github.com/orgs/owlbear-rodeo/repositories
    }
}