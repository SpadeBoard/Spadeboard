using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Utils;

namespace Services
{
    public class CardFaceDtoService(IMapper mapper, ICardFaceService cardFaceService) : ICardFaceDtoService
    {
        private readonly ICardFaceService _cardFaceService = cardFaceService;
        private readonly IMapper _mapper = mapper;

        public async Task<CardFaceDto> CreateDtoAsync(CardFaceDto cardFaceDto)
        {
            CardFace cardFace = _mapper.Map<CardFace>(cardFaceDto);
            cardFace = await _cardFaceService.CreateAsync(cardFace);
            return  _mapper.Map<CardFaceDto>(cardFace);
        }
        
        public async Task<CardFaceDto?> GetDtoAsync(string id)
        {
            CardFace? cardFace = await _cardFaceService.GetAsync(DtoIdConversion.DtoStringToLong(id));

            if (cardFace == null)
            {
                return null;
            }

            return _mapper.Map<CardFaceDto>(cardFace);
        }

        public async Task<bool> UpdateDtoAsync(string id, CardFaceDto cardFaceDto)
        {
            if (!Exists(id)) {
                return false;
            }

            CardFace cardFace = _mapper.Map<CardFace>(cardFaceDto);
            bool updated = await _cardFaceService.UpdateAsync(DtoIdConversion.DtoStringToLong(id), cardFace);

            return updated;
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
             if (!Exists(id)) {
                return false;
            }

            bool deleted = await _cardFaceService.DeleteAsync(DtoIdConversion.DtoStringToLong(id));

            return deleted;
        }

        public async Task<CardFaceDto> CreateDtoNavAsync(CardFaceDto cardFaceDto)
        {
            CardFace cardFace = _mapper.Map<CardFace>(cardFaceDto);

            if (cardFace.Style == null)
            {
                throw new ArgumentException("Item: Card Face Dto: Style cannot be null", nameof(cardFaceDto));
            }

            cardFace.Style.StyleId = 0;
            cardFace = await _cardFaceService.CreateNavAsync(cardFace);
            return  _mapper.Map<CardFaceDto>(cardFace);
        }
        
        public async Task<CardFaceDto?> GetDtoNavAsync(string id)
        {
            CardFace? cardFace = await _cardFaceService.GetNavAsync(DtoIdConversion.DtoStringToLong(id));

            if (cardFace == null)
            {
                return null;
            }

            return _mapper.Map<CardFaceDto>(cardFace);
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardFaceDto cardFaceDto)
        {
            if (!Exists(id)) {
                return false;
            }

            CardFace cardFace = _mapper.Map<CardFace>(cardFaceDto);
            bool updated = await _cardFaceService.UpdateNavAsync(cardFace);

            return updated;
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            if (!Exists(id)) {
                return false;
            }

            bool deleted = await _cardFaceService.DeleteNavAsync(DtoIdConversion.DtoStringToLong(id));

            return deleted;
        }

        public bool Exists(string id)
        {
            return _cardFaceService.Exists(DtoIdConversion.DtoStringToLong(id));
        }

        public async Task<IEnumerable<CardFaceDto>> GetAllDtoAsync() 
        {
            return _mapper.Map<IEnumerable<CardFaceDto>>(await _cardFaceService.GetAllAsync());
        }
    }
}