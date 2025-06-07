using Models.Cards;

namespace Services
{
    public interface ICardFaceElementService : ICrud<CardFaceElement>, ICrudNav<CardFaceElement>
    {
        public Task<CardFaceElement?> GetImageNavAsync(long id);

        public Task DeleteAllNavAsync(CardFaceElement[] cardFaceElements) ;

        public Task<bool> UpdateAllNavAsync(CardFaceElement[] cardFaceElements);
    }
}