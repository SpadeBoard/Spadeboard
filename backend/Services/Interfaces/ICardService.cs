using Models.Cards;

namespace Services
{
    public interface ICardService 
    {
        Task<IEnumerable<Card>> GetCardsByOwner(string ownerId);
        
        // TODO: Refactor the card DTO functions
        bool Exists(int id);
    }
}