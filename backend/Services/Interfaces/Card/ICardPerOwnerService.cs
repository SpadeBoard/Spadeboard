using System.Threading.Channels;
using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardPerOwnerService: ICrud<CardPerOwner>
    {
        public Task<CardPerOwner?> GetNavByCardIdAsync(int cardId);

        public Task<CardPerOwner?> GetByCardIdAndOwnerIdAsync(int cardId, string ownerId);

        public Task<CardPerOwner?> GetByCardIdAsync(int cardId);

        public Task<IEnumerable<Card>> GetCardsNavByOwnerIdAsync(string ownerId);
    }
}