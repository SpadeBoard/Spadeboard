using Models.Cards;

namespace Services
{
    public interface ICardFaceService
    {
        Task UpdateCardFaceDtoAsync(CardFace cardFace);
        Task DeleteCardFaceDtoAsync(CardFace cardFace);

        Task<CardFace> GetCardFaceDtoAsync(int cardFaceId);
    
        bool Exists(int id);
    }
}