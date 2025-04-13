using Models.Cards;

namespace Services
{
    public interface ICardService 
    {
        // Task<IEnumerable<Card>> GetCardsByOwner(string ownerId);
        
        Task<Card?> GetCardAsync(int cardId);

        public Task UpdateCardDtoAsync(CardDto cardDto);

        // TODO: Refactor the card DTO functions
        bool Exists(int id);
    }
}