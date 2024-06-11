using Models.Cards;

namespace Services
{
    public interface ICardService 
    {
        Task<IEnumerable<Card>> GetCardsByOwner(string ownerId);
        bool Exists(int id);
    }
}