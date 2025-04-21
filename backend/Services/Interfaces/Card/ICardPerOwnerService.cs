using System.Threading.Channels;
using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardPerOwnerService: ICrud<CardPerOwner>
    {
        public Task<CardPerOwner?> GetCardPerOwnerByCardIdAndOwnerIdAsync(int cardId, string ownerId);

        public Task<CardPerOwner?> GetCardPerOwnerByCardIdAsync(int cardId);

        public Task<IEnumerable<Card>> GetCardsNavByOwnerIdAsync(string ownerId);
    }
}