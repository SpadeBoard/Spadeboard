using Models.Cards;

namespace Services
{
    public interface ICardFaceService
    {
        Task UpdateCardFaceDtoAsync(CardFace cardFace);
        Task DeleteCardFaceDtoAsync(CardFace cardFace);

        Task<CardFace> GetCardFaceNavAsync(int cardFaceId);

        Task CreateCardFaceNavAsync(CardFace cardFace);
    
        bool Exists(int id);
    }
}