using Models.Cards;

namespace Services
{
    public interface ICardFaceElementService : ICrud<CardFaceElement>, ICrudNav<CardFaceElement>
    {
        public Task<IEnumerable<CardFaceElement>> GetAllByCardFaceIdAsync(long cardFaceId);



        public Task<IEnumerable<CardFaceElement>> GetAllNavAsync();

        public Task<CardFaceElement?> GetNavAsync(long id);

        public Task<IEnumerable<CardFaceElement>> GetAllNavByCardFaceId(long cardFaceId);

        public Task CreateAllNavCardFaceAsync(CardFaceElement[] cardFaceElements, CardFace cardFace);
    
        public Task DeleteAllNavAsync(CardFaceElement[] cardFaceElements) ;

        public Task<bool> UpdateAllNavAsync(CardFaceElement[] cardFaceElements);

        public Task<bool> UpdateNavAsync(CardFaceElement cardFaceElement);

        public Task CreateNavAsync(CardFaceElement nav);
    }
}