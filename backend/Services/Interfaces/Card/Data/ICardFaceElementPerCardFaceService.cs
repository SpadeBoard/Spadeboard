using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardFaceElementPerCardFaceService: ICrud<CardFaceElementPerCardFace>, ICrudNav<CardFaceElementPerCardFace>
    {
        public Task<IEnumerable<CardFaceElementPerCardFace>> GetAllNavByCardFaceElementIdAndCardFaceIdAsync(long cardFaceElementId, long cardFaceId);
    
        public Task CreateAllNavByCardFaceIdAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace);

        public Task CreateAllNavByCardFaceIdFromExistingAllNavAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace);

        public Task<IEnumerable<CardFaceElementPerCardFace>> GetAllNavByCardFaceIdAsync(long cardFaceId);
        
        public Task<bool> UpdateAllNavByCardFaceAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace);
    }
}