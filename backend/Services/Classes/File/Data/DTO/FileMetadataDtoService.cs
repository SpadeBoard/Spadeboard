using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Models.Files;

namespace Services
{
    public class FileMetadataDtoService: IFileMetadataDtoService
    {
        private readonly IFileMetadataService _fileMetadataService;
        private readonly IMapper _mapper;

        private readonly DtoCrudService<FileMetadata, FileMetadataDto> _dtoCrudService;

        public FileMetadataDtoService(IMapper mapper, IFileMetadataService fileMetadataService) 
        {
           _fileMetadataService =fileMetadataService;
            _mapper = mapper;
             _dtoCrudService = new(_mapper, _fileMetadataService);
        }

        public async Task<FileMetadataDto> CreateDtoAsync(FileMetadataDto styleDto)
        {
            return await _dtoCrudService.CreateDtoAsync(styleDto);
        }

        public async Task<IEnumerable<FileMetadataDto>> GetAllDtoAsync() {
            return  await _dtoCrudService.GetAllDtoAsync();
        }
        
        public async Task<FileMetadataDto?> GetDtoAsync(string id)
        {
            return  await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, FileMetadataDto styleDto)
        {
             return await _dtoCrudService.UpdateDtoAsync(id, styleDto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public async Task<FileMetadataDto> CreateDtoNavAsync(FileMetadataDto styleDto)
        {
            throw new NotImplementedException();
        }
        
        public async Task<FileMetadataDto?> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, FileMetadataDto styleDto)
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