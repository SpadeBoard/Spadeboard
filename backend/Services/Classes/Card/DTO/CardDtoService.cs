using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Utils;

namespace Services
{
    public class CardDtoService(IMapper mapper, ICardService cardService) : ICardDtoService
    {
        private readonly ICardService _cardService = cardService;
        private readonly IMapper _mapper = mapper;

        public async Task<CardDto> CreateDtoAsync(CardDto cardDto)
        {
            Card card = _mapper.Map<Card>(cardDto);
            card = await _cardService.CreateAsync(card);
            return  _mapper.Map<CardDto>(card);
        }

        public async Task<IEnumerable<CardDto>> GetAllDtoAsync() {
             return  _mapper.Map<IEnumerable<CardDto>>(await _cardService.GetAllAsync());
        }
        
        public async Task<CardDto?> GetDtoAsync(string id)
        {
            if (!Exists(id)) {
                return null;
            }

            Card? card = await _cardService.GetAsync(DtoIdConversion.DtoStringToLong(id));

            if (card == null)
            {
                return null;
            }

            return _mapper.Map<CardDto>(card);
        }

        public async Task<bool> UpdateDtoAsync(string id, CardDto cardDto)
        {
            if (!Exists(id)) {
                return false;
            }

            Card card = _mapper.Map<Card>(cardDto);
            bool updated = await _cardService.UpdateAsync(card.CardId, card);

            return updated;
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            if (!Exists(id)) {
                return false;
            }

            bool deleted = await _cardService.DeleteAsync( DtoIdConversion.DtoStringToLong(id));

            return deleted;
        }

        public async Task<CardDto> CreateDtoNavAsync(CardDto cardDto)
        {
            throw new NotImplementedException();
        }
        
        public async Task<CardDto?> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardDto cardDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
           throw new NotImplementedException();
        }


        public bool Exists(string id)
        {
            return _cardService.Exists(DtoIdConversion.DtoStringToLong(id));
        }
    }
}