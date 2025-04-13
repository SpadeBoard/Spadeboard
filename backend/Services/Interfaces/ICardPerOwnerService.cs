using System.Threading.Channels;
using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardPerOwnerService
    {
        public Task<CardPerOwner?> GetCardPerOwnerByCardIdAsync(int cardId);

        public Task<IEnumerable<Card>> GetCardsPerOwnerAsync(string ownerId);

        public Task<CardPerOwner> CreateCardPerOwnerAsync(CardPerOwner cpo);
    }
}