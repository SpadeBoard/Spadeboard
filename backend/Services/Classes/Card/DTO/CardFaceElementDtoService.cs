using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Models.DndItems;
using Utils;

namespace Services
{
    public class CardFaceElementDtoService : ICardFaceElementDtoService
    {
        private readonly ICardFaceElementService _cardFaceElementService;
        private readonly IMapper _mapper;

        private readonly DtoCrudService<CardFaceElement, CardFaceElementDto> _dtoCrudService;

        public CardFaceElementDtoService(IMapper mapper, ICardFaceElementService cardFaceElementService)
        {
            _mapper = mapper;
            _cardFaceElementService = cardFaceElementService;
            _dtoCrudService = new DtoCrudService<CardFaceElement, CardFaceElementDto>(_mapper, _cardFaceElementService);
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
            CardFaceElement cardFaceElement = _mapper.Map<CardFaceElement>(cardFaceElementDto);
            cardFaceElement = await _cardFaceElementService.CreateNavAsync(cardFaceElement);
            return  _mapper.Map<CardFaceElementDto>(cardFaceElement);
        }
        
        public async Task<CardFaceElementDto?> GetDtoNavAsync(string id)
        {
            CardFaceElement? cardFaceElement = await _cardFaceElementService.GetNavAsync(DtoIdConversion.DtoStringToLong(id));

            if (cardFaceElement == null)
            {
                return null;
            }

            return _mapper.Map<CardFaceElementDto>(cardFaceElement);
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardFaceElementDto cardFaceElementDto)
        {
            if (!Exists(id)) {
                return false;
            }

            CardFaceElement cardFaceElement = _mapper.Map<CardFaceElement>(cardFaceElementDto);
            bool updated = await _cardFaceElementService.UpdateNavAsync(cardFaceElement);

            return updated;
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
           if (!Exists(id)) {
                return false;
            }

            return await _cardFaceElementService.DeleteNavAsync(DtoIdConversion.DtoStringToLong(id));
        }

        public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }

        public async Task<IEnumerable<CardFaceElementDto>> GetAllDtoAsync() 
        {
            return  await _dtoCrudService.GetAllDtoAsync();
        }
    }
}