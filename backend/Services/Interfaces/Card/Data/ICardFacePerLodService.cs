using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardFacePerLodService: ICrud<CardFacePerLod>
    {
        public Task<IEnumerable<long>> GetFileMetadataIdsByCardFace(long cardFaceId);

        public Task<bool> OrphanLodsByCardFaceIdAsync(long cardFaceId);

        public Task<bool> AttachLodsByCardFaceIdAsync(long cardFaceId);

        public Task<IEnumerable<CardFacePerLod>> CreateAllAsync(CardFacePerLod[] items, CardFace cardFace);
    }
}