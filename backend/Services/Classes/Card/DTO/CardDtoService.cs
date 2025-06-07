using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Utils;

namespace Services
{
    public class CardDtoService : ICardDtoService
    {
        private readonly ICardService _cardService;
        private readonly IMapper _mapper;
        private readonly DtoCrudService<Card, CardDto> _dtoCrudService;

        public CardDtoService(IMapper mapper, ICardService cardService)
        {
            _mapper = mapper;
            _cardService = cardService;
            _dtoCrudService = new DtoCrudService<Card, CardDto>(_mapper, _cardService);
        }

        public async Task<CardDto> CreateDtoAsync(CardDto cardDto)
        {
            return await _dtoCrudService.CreateDtoAsync(cardDto);
        }

        public async Task<IEnumerable<CardDto>> GetAllDtoAsync() {
             return  await _dtoCrudService.GetAllDtoAsync();
        }
        
        public async Task<CardDto?> GetDtoAsync(string id)
        {
            return await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, CardDto cardDto)
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