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

         public CardFaceDtoService(IMapper mapper, ICardFaceService cardFaceService)
        {
            _mapper = mapper;
            _cardFaceService = cardFaceService;
            _dtoCrudService = new DtoCrudService<CardFace, CardFaceDto>(_mapper, _cardFaceService);
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
            CardFace cardFace = _mapper.Map<CardFace>(cardFaceDto);

            if (cardFace.Style == null)
            {
                throw new ArgumentException("Item: Card Face Dto: Style cannot be null", nameof(cardFaceDto));
            }

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
            return _dtoCrudService.Exists(id);
        }

        public async Task<IEnumerable<CardFaceDto>> GetAllDtoAsync() 
        {
            return  await _dtoCrudService.GetAllDtoAsync();
        }
    }
}