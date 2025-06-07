using AutoMapper;
using Models.Cards;
namespace Services
{
    public class CardFaceElementDtoService : ICardFaceElementDtoService
    {
        private readonly ICardFaceElementService _cardFaceElementService;
        private readonly IMapper _mapper;

        private readonly DtoCrudService<CardFaceElement, CardFaceElementDto> _dtoCrudService;

        private readonly DtoNavCrudService<CardFaceElement, CardFaceElementDto> _dtoNavCrudService;

        public CardFaceElementDtoService(IMapper mapper, ICardFaceElementService cardFaceElementService)
        {
            _mapper = mapper;
            _cardFaceElementService = cardFaceElementService;
            _dtoCrudService = new DtoCrudService<CardFaceElement, CardFaceElementDto>(_mapper, _cardFaceElementService);
             _dtoNavCrudService = new DtoNavCrudService<CardFaceElement, CardFaceElementDto>(_mapper, _cardFaceElementService);
        }

        public async Task<CardFaceElementDto> CreateDtoAsync(CardFaceElementDto cardFaceElementDto)
        {
            return await _dtoCrudService.CreateDtoAsync(cardFaceElementDto);
        }
        
        public async Task<CardFaceElementDto?> GetDtoAsync(string id)
        {
             return  await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, CardFaceElementDto cardFaceElementDto)
        {
           return await _dtoCrudService.UpdateDtoAsync(id, cardFaceElementDto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public async Task<CardFaceElementDto> CreateDtoNavAsync(CardFaceElementDto cardFaceElementDto)
        {
            return await _dtoNavCrudService.CreateDtoNavAsync(cardFaceElementDto);
        }
        
        public async Task<CardFaceElementDto?> GetDtoNavAsync(string id)
        {
             return await _dtoNavCrudService.GetDtoNavAsync(id);
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardFaceElementDto cardFaceElementDto)
        {
            return await _dtoNavCrudService.UpdateDtoNavAsync(id, cardFaceElementDto);
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
           return await _dtoNavCrudService.DeleteDtoNavAsync(id);
        }

        public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }

        public async Task<IEnumerable<CardFaceElementDto>> GetAllDtoNavAsync() 
        {
            return  await _dtoNavCrudService.GetAllDtoNavAsync();
        }

        public async Task<IEnumerable<CardFaceElementDto>> GetAllDtoAsync() 
        {
            return  await _dtoCrudService.GetAllDtoAsync();
        }
    }
}