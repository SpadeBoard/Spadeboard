using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardFacePerCardService: ICrud<CardFacePerCard>, ICrudNav<CardFacePerCard>
    {
        public Task<IEnumerable<CardFace>> GetAllFacesByCardId(long cardId);

        public Task<IEnumerable<CardFacePerCard>> GetAllByCardId(long cardId);
    
        public Task<bool> DeleteByCardAndCardFaceAsync(long cardId, long cardFaceId);

        public Task<IEnumerable<FileStream>> GetCardFacesByLodAsync(long cardId, int lod);
    }
}