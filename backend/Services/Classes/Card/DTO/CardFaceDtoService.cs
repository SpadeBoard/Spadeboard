using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Utils;

namespace Services
{
    public class CardFaceDtoService: ICardFaceDtoService
    {
        private readonly ICardFaceService _cardFaceService;
        private readonly IMapper _mapper;
        private readonly DtoCrudService<CardFace, CardFaceDto> _dtoCrudService;

        private readonly DtoNavCrudService<CardFace, CardFaceDto> _dtoNavCrudService;

         public CardFaceDtoService(IMapper mapper, ICardFaceService cardFaceService)
        {
            _mapper = mapper;
            _cardFaceService = cardFaceService;
            _dtoCrudService = new DtoCrudService<CardFace, CardFaceDto>(_mapper, _cardFaceService);
             _dtoNavCrudService = new DtoNavCrudService<CardFace, CardFaceDto>(_mapper, _cardFaceService);
        }

        public async Task<CardFaceDto> CreateDtoAsync(CardFaceDto cardFaceDto)
        {
           return await _dtoCrudService.CreateDtoAsync(cardFaceDto);
        }
        
        public async Task<CardFaceDto?> GetDtoAsync(string id)
        {
           return await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, CardFaceDto cardFaceDto)
        {
           return await _dtoCrudService.UpdateDtoAsync(id, cardFaceDto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public async Task<CardFaceDto> CreateDtoNavAsync(CardFaceDto cardFaceDto)
        {
            return await _dtoNavCrudService.CreateDtoNavAsync(cardFaceDto);
        }
        
        public async Task<CardFaceDto?> GetDtoNavAsync(string id)
        {
            return await _dtoNavCrudService.GetDtoNavAsync(id);
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardFaceDto cardFaceDto)
        {
           return await _dtoNavCrudService.UpdateDtoNavAsync(id, cardFaceDto);
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
           return await _dtoNavCrudService.DeleteDtoNavAsync(id);
        }

        public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }

        public async Task<IEnumerable<CardFaceDto>> GetAllDtoAsync() 
        {
            return  await _dtoCrudService.GetAllDtoAsync();
        }

        public async Task<IEnumerable<CardFaceDto>> GetAllDtoNavAsync() 
        {
            return  await _dtoNavCrudService.GetAllDtoNavAsync();
        }
    }
}