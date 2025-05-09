using Models.Cards;

namespace Services
{
    public interface ICardFaceElementService : ICrud<CardFaceElement>, ICrudNav<CardFaceElement>
    {
        public Task DeleteAllNavAsync(CardFaceElement[] cardFaceElements) ;

        public Task<bool> UpdateAllNavAsync(CardFaceElement[] cardFaceElements);
    }
}