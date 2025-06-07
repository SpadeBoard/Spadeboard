using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Models.DndItems;
using Utils;

namespace Services
{
    public class CardPerOwnerDtoService: ICardPerOwnerDtoService
    {
        private readonly ICardPerOwnerService _cardPerOwnerService;
        private readonly IMapper _mapper;
        private readonly DtoCrudService<CardPerOwner, CardPerOwnerDto> _dtoCrudService;

        public CardPerOwnerDtoService(IMapper mapper, ICardPerOwnerService cardPerOwnerService) 
        {
            _cardPerOwnerService = cardPerOwnerService;
            _mapper = mapper;
             _dtoCrudService = new(_mapper, _cardPerOwnerService);
        }

        public async Task<CardPerOwnerDto> CreateDtoAsync(CardPerOwnerDto cardPerOwnerDto)
        {
           return await _dtoCrudService.CreateDtoAsync(cardPerOwnerDto);
        }
        
        public async Task<CardPerOwnerDto?> GetDtoAsync(string id)
        {
            return  await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<CardPerOwnerDto?> GetDtoByCardIdAndOwnerIdAsync(string cardId, string ownerId)
        {
            return _mapper.Map<CardPerOwnerDto>(await _cardPerOwnerService.GetByCardIdAndOwnerIdAsync(DtoIdConversion.DtoStringToLong(cardId), ownerId));
        }

        public async Task<IEnumerable<CardDto>> GetCardsDtoByOwnerIdAsync(string ownerId)
        {
            return _mapper.Map<IEnumerable<CardDto>>(await _cardPerOwnerService.GetCardsByOwnerIdAsync(ownerId));
        }

        public async Task<bool> UpdateDtoAsync(string id, CardPerOwnerDto cardPerOwnerDto)
        {
            return await _dtoCrudService.UpdateDtoAsync(id, cardPerOwnerDto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
           return await _dtoCrudService.DeleteDtoAsync(id);
        }

         public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }


        public async Task<CardPerOwnerDto?> GetDtoByCardIdAsync(string cardId)
        {
            return _mapper.Map<CardPerOwnerDto?>(await _cardPerOwnerService.GetByCardIdAsync(DtoIdConversion.DtoStringToLong(cardId)));
        }

        public async Task<IEnumerable<CardPerOwnerDto>> GetAllDtoAsync()
        {
           return  await _dtoCrudService.GetAllDtoAsync();
        }

        public async Task<bool> DeleteDtoByCardIdAndOwnerIdAsync(string cardId, string ownerId)
        {
            return await _cardPerOwnerService.DeleteByCardIdAndOwnerIdAsync(DtoIdConversion.DtoStringToLong(cardId), ownerId);
        }
    }
}