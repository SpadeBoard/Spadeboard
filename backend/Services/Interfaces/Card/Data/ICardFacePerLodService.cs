using Models.Bridge;
using Models.Files;

namespace Services
{
    public interface ICardFacePerLodService: ICrud<CardFacePerLod>
    {
        public Task<IEnumerable<long>> GetFileMetadataIdsByCardFace(long cardFaceId);

        public Task<IEnumerable<FileMetadata>> GetFilesMetadataByCardFace(long cardFaceId);

        public Task<IEnumerable<string>> GetFileMetadataFileNamesByCardFace(long cardFaceId);

        public Task<bool> OrphanLodsByCardFaceIdAsync(long cardFaceId);

        public Task<bool> AttachLodsByCardFaceIdAsync(long cardFaceId);

        public Task<IEnumerable<CardFacePerLod>> CreateAllFromFilesMetadataPerCardFaceAsync(FileMetadata[] filesMetadata, long cardFaceId);

        public Task<IEnumerable<CardFacePerLod>> GetCardFacePerLodByCardFace(long cardFaceId);
    }
}