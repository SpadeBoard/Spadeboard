using AutoMapper;
using Models.Files;

namespace Services
{
    public class FileMetadataDtoService : IFileMetadataDtoService
    {
        private readonly IFileMetadataService _fileMetadataService;
        private readonly IMapper _mapper;

        private readonly DtoCrudService<FileMetadata, FileMetadataDto> _dtoCrudService;

        public FileMetadataDtoService(IMapper mapper, IFileMetadataService fileMetadataService)
        {
            _fileMetadataService = fileMetadataService;
            _mapper = mapper;
            _dtoCrudService = new(_mapper, _fileMetadataService);
        }

        public async Task<FileMetadataDto> CreateDtoAsync(FileMetadataDto fileMetadataDto)
        {
            return await _dtoCrudService.CreateDtoAsync(fileMetadataDto);
        }

        public async Task<IEnumerable<FileMetadataDto>> CreateAllDtoAsync(FileMetadataDto[] items)
        {
            FileMetadata[] fileMetadata = _mapper.Map<FileMetadata[]>(items);
            return _mapper.Map<IEnumerable<FileMetadataDto>>(await _fileMetadataService.CreateAllAsync(fileMetadata));
        }

        public async Task<IEnumerable<FileMetadataDto>> GetAllDtoAsync()
        {
            return await _dtoCrudService.GetAllDtoAsync();
        }

        public async Task<FileMetadataDto?> GetDtoAsync(string id)
        {
            return await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, FileMetadataDto fileMetadataDto)
        {
            return await _dtoCrudService.UpdateDtoAsync(id, fileMetadataDto);
        }

        public async Task<bool> UpdateAllDtoAsync(FileMetadataDto[] fileMetadataDto)
        {
            FileMetadata[] fileMetadata = _mapper.Map<FileMetadata[]>(fileMetadataDto);
            return await _fileMetadataService.UpdateAllAsync(fileMetadata);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public async Task<FileMetadataDto> CreateDtoNavAsync(FileMetadataDto fileMetadataDto)
        {
            throw new NotImplementedException();
        }

        public async Task<FileMetadataDto?> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, FileMetadataDto fileMetadataDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }
    }
}