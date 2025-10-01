using Models.Files;

namespace Services
{
    public interface IFileMetadataDtoService: ICrudDto<FileMetadataDto>
    {
        public Task<IEnumerable<FileMetadataDto>> CreateAllDtoAsync(FileMetadataDto[] items);
        public Task<bool> UpdateAllDtoAsync(FileMetadataDto[] fileMetadataDto);
    }
}