using AutoMapper;
using Models.Bridge;
using Services;

namespace Services
{
    public class FileAuthenticationPerExportedCardDtoService : IFileAuthenticationPerExportedCardDtoService
    {
        private readonly IFileAuthenticationPerExportedCardService _fileAuthenticationPerExportedCardService;
        private readonly IMapper _mapper;
        private readonly DtoCrudService<FileAuthenticationPerExportedCard, FileAuthenticationPerExportedCardDto> _dtoCrudService;

        public FileAuthenticationPerExportedCardDtoService(IMapper mapper, IFileAuthenticationPerExportedCardService fileAuthenticationPerExportedCardService)
        {
            _mapper = mapper;
            _fileAuthenticationPerExportedCardService = fileAuthenticationPerExportedCardService;
            _dtoCrudService = new DtoCrudService<FileAuthenticationPerExportedCard, FileAuthenticationPerExportedCardDto>(_mapper, _fileAuthenticationPerExportedCardService);
        }

        public async Task<FileAuthenticationPerExportedCardDto> CreateDtoAsync(FileAuthenticationPerExportedCardDto cardDto)
        {
            return await _dtoCrudService.CreateDtoAsync(cardDto);
        }

        public async Task<IEnumerable<FileAuthenticationPerExportedCardDto>> GetAllDtoAsync() {
             return  await _dtoCrudService.GetAllDtoAsync();
        }
        
        public async Task<FileAuthenticationPerExportedCardDto?> GetDtoAsync(string id)
        {
            return await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, FileAuthenticationPerExportedCardDto cardDto)
        {
            return await _dtoCrudService.UpdateDtoAsync(id, cardDto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }
    }
}