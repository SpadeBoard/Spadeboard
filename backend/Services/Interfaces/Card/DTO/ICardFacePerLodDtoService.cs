using Models.Bridge;
using Models.Files;

namespace Services
{
    public interface ICardFacePerLodDtoService: ICrudDto<CardFacePerLodDto>
    {
        public Task<bool> AttachLodsByCardFaceIdDtoAsync(string cardFaceId);

        public Task<bool> OrphanLodsByCardFaceIdDtoAsync(string cardFaceId);

        public Task<IEnumerable<FileMetadataDto>> GetFilesMetadataByCardFaceDto(string cardFaceId);

        public Task<IEnumerable<CardFacePerLodDto>> CreateAllFromFilesMetadataPerCardFaceDtoAsync(FileMetadataDto[] filesMetadata, string cardFaceId);
    }
}