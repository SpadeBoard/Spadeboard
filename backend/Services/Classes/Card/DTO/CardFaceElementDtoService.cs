using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Models.DndItems;
using Utils;

namespace Services
{
    public class CardFaceElementDtoService(IMapper mapper, ICardFaceElementService cardFaceElementService) : ICardFaceElementDtoService
    {
        private readonly ICardFaceElementService _cardFaceElementService = cardFaceElementService;
        private readonly IMapper _mapper = mapper;

        public async Task<CardFaceElementDto> CreateDtoAsync(CardFaceElementDto cardFaceElementDto)
        {
            CardFaceElement cardFaceElement = _mapper.Map<CardFaceElement>(cardFaceElementDto);
            cardFaceElement = await _cardFaceElementService.CreateAsync(cardFaceElement);
            return  _mapper.Map<CardFaceElementDto>(cardFaceElement);
        }
        
        public async Task<CardFaceElementDto?> GetDtoAsync(string id)
        {
            CardFaceElement? cardFaceElement = await _cardFaceElementService.GetAsync(DtoIdConversion.DtoStringToLong(id));

            if (cardFaceElement == null)
            {
                return null;
            }

            return _mapper.Map<CardFaceElementDto>(cardFaceElement);
        }

        public async Task<bool> UpdateDtoAsync(string id, CardFaceElementDto cardFaceElementDto)
        {
            if (!Exists(id)) {
                return false;
            }

            CardFaceElement cardFaceElement = _mapper.Map<CardFaceElement>(cardFaceElementDto);
            bool updated = await _cardFaceElementService.UpdateAsync(DtoIdConversion.DtoStringToLong(id), cardFaceElement);

            return updated;
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            if (!Exists(id)) {
                return false;
            }

            bool deleted = await _cardFaceElementService.DeleteAsync(DtoIdConversion.DtoStringToLong(id));

            return deleted;
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
            return _cardFaceElementService.Exists(DtoIdConversion.DtoStringToLong(id));
        }

        public async Task<IEnumerable<CardFaceElementDto>> GetAllDtoAsync() 
        {
            return _mapper.Map<IEnumerable<CardFaceElementDto>>(await _cardFaceElementService.GetAllAsync());
        }
    }
}