using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardFaceElementPerCardFaceService: ICrud<CardFaceElementPerCardFace>, ICrudNav<CardFaceElementPerCardFace>
    {
        public Task<IEnumerable<CardFaceElementPerCardFace>> GetAllNavByCardFaceElementIdAndCardFaceIdAsync(int cardFaceElementId, int cardFaceId);
    
        public Task CreateAllNavByCardFaceIdAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace);

        public Task CreateAllNavByCardFaceIdFromExistingAllNavAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace);

        public Task<IEnumerable<CardFaceElementPerCardFace>> GetAllNavByCardFaceIdAsync(int cardFaceId);
        
        public Task<bool> UpdateAllNavByCardFaceIdAsync(CardFaceElementPerCardFace[] cardFaceElementsPerCardFace, CardFace cardFace);
    }
}