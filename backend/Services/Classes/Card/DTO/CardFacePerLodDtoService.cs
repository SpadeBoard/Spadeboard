using AutoMapper;
using Models.Bridge;
using Utils;
using Models.Files;

namespace Services
{
    public class CardFacePerLodDtoService : ICardFacePerLodDtoService
    {
        private readonly ICardFacePerLodService _cardFacePerLodService;
        private readonly IMapper _mapper;
        private readonly DtoCrudService<CardFacePerLod, CardFacePerLodDto> _dtoCrudService;

        public CardFacePerLodDtoService(IMapper mapper, ICardFacePerLodService cardFacePerLodService)
        {
            _mapper = mapper;
            _cardFacePerLodService = cardFacePerLodService;
            _dtoCrudService = new DtoCrudService<CardFacePerLod, CardFacePerLodDto>(_mapper, _cardFacePerLodService);
        }

        public async Task<IEnumerable<CardFacePerLodDto>> CreateAllFromFilesMetadataPerCardFaceDtoAsync(FileMetadataDto[] filesMetadata, string cardFaceId)
        {
            return _mapper.Map<IEnumerable<CardFacePerLodDto>>(await _cardFacePerLodService.CreateAllFromFilesMetadataPerCardFaceAsync(_mapper.Map<IEnumerable<FileMetadata>>(filesMetadata).ToArray(), DtoIdConversion.DtoStringToLong(cardFaceId)));
        }

        public async Task<CardFacePerLodDto> CreateDtoAsync(CardFacePerLodDto dto)
        {
            return await _dtoCrudService.CreateDtoAsync(dto);
        }

        public async Task<IEnumerable<CardFacePerLodDto>> GetAllDtoAsync()
        {
            return await _dtoCrudService.GetAllDtoAsync();
        }
        
        public async Task<CardFacePerLodDto?> GetDtoAsync(string id)
        {
            return await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, CardFacePerLodDto dto)
        {
            return await _dtoCrudService.UpdateDtoAsync(id, dto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }

        public async Task<IEnumerable<FileMetadataDto>> GetFilesMetadataByCardFaceDto(string cardFaceId)
        {
            return _mapper.Map<IEnumerable<FileMetadataDto>>(await _cardFacePerLodService.GetFilesMetadataByCardFace(DtoIdConversion.DtoStringToLong(cardFaceId)));
        }

        public async Task<IEnumerable<string>> GetFileMetadataFileNamesByCardFaceDto(string cardFaceId)
        {
            return await _cardFacePerLodService.GetFileMetadataFileNamesByCardFace(DtoIdConversion.DtoStringToLong(cardFaceId));
        }

        public async Task<bool> AttachLodsByCardFaceIdDtoAsync(string cardFaceId) 
        {
            return await _cardFacePerLodService.AttachLodsByCardFaceIdAsync(DtoIdConversion.DtoStringToLong(cardFaceId));
        }

        public async Task<bool> OrphanLodsByCardFaceIdDtoAsync(string cardFaceId) 
        {
            return await _cardFacePerLodService.OrphanLodsByCardFaceIdAsync(DtoIdConversion.DtoStringToLong(cardFaceId));
        }

         public async Task<bool> UpdateFileMetadataByCardFaceDto(string cardFaceId, List<string> fileMetadataIds)
         {
            List<long> ids = [];
            ids.AddRange(fileMetadataIds.Select(fileMetadataId => DtoIdConversion.DtoStringToLong(fileMetadataId)));

            return await _cardFacePerLodService.UpdateFileMetadataByCardFace(
                DtoIdConversion.DtoStringToLong(cardFaceId), 
                ids);
        }
    }
}