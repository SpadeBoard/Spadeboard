using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Models.DndItems;
using Utils;

namespace Services
{
    public class CardPerOwnerDtoService(IMapper mapper, ICardPerOwnerService cardPerOwnerService) : ICardPerOwnerDtoService
    {
        private readonly ICardPerOwnerService _cardPerOwnerService = cardPerOwnerService;
        private readonly IMapper _mapper = mapper;

        public async Task<CardPerOwnerDto> CreateDtoAsync(CardPerOwnerDto cardPerOwnerDto)
        {
            CardPerOwner cardPerOwner = _mapper.Map<CardPerOwner>(cardPerOwnerDto);
            cardPerOwner = await  _cardPerOwnerService.CreateAsync(cardPerOwner);
            return  _mapper.Map<CardPerOwnerDto>(cardPerOwner);
        }
        
        public async Task<CardPerOwnerDto?> GetDtoAsync(string id)
        {
            CardPerOwner? cardPerOwner = await  _cardPerOwnerService.GetAsync(DtoIdConversion.DtoStringToLong(id));

            if (cardPerOwner == null)
            {
                return null;
            }

            return _mapper.Map<CardPerOwnerDto>(cardPerOwner);
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
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
           if (! Exists(id)) {
                return false;
            }

            bool deleted = await  _cardPerOwnerService.DeleteAsync(DtoIdConversion.DtoStringToLong(id));

            return deleted;
        }

        public async Task<CardPerOwnerDto> CreateDtoNavAsync(CardPerOwnerDto cardPerOwnerDto)
        {
            throw new NotImplementedException();
        }
        
        // TODO: Think about where you should implement this
        public async Task<CardPerOwnerDto?> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardPerOwnerDto cardPerOwnerDto)
        {
           throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

         public bool Exists(string id)
        {
            return _cardPerOwnerService.Exists(DtoIdConversion.DtoStringToLong(id));
        }


        public async Task<CardPerOwnerDto?> GetDtoByCardIdAsync(string cardId)
        {
            return _mapper.Map<CardPerOwnerDto?>(await _cardPerOwnerService.GetByCardIdAsync(DtoIdConversion.DtoStringToLong(cardId)));
        }

        public async Task<IEnumerable<CardPerOwnerDto>> GetAllDtoAsync()
        {
            return _mapper.Map<IEnumerable<CardPerOwnerDto>>(await _cardPerOwnerService.GetAllAsync());
        }
    }
}