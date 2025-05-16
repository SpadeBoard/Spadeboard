using System.Threading.Channels;
using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardPerOwnerService: ICrud<CardPerOwner>
    {
        public Task<CardPerOwner?> GetNavByCardIdAsync(long cardId);

        public Task<CardPerOwner?> GetByCardIdAndOwnerIdAsync(long cardId, string ownerId);

        public Task<CardPerOwner?> GetByCardIdAsync(long cardId);

        public Task<IEnumerable<Card>> GetCardsByOwnerIdAsync(string ownerId);

        public Task<bool> DeleteByCardIdAndOwnerIdAsync(long cardId, string ownerId);
    }
}