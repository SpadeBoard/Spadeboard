using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Models.Bridge;
using AutoMapper;
using Utils;

namespace Services
{
    public class CardPositionPerRoomDtoService(ICardPositionPerRoomService cardPositionPerRoomService, IMapper mapper): ICardPositionPerRoomDtoService
    {
        private readonly ICardPositionPerRoomService _cardPositionPerRoomService = cardPositionPerRoomService;
        private readonly IMapper _mapper = mapper;

        public bool Exists(string id)
        {
            return _cardPositionPerRoomService.Exists(DtoIdConversion.DtoStringToLong(id));
        }

        public Task<IEnumerable<CardPositionPerRoomDto>> GetAllDtoAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<CardPositionPerRoomDto?> GetDtoAsync(string id)
        {
             CardPositionPerRoom? cardPositionPerRoom = await _cardPositionPerRoomService.GetAsync(DtoIdConversion.DtoStringToLong(id));

            if (cardPositionPerRoom == null)
            {
                return null;
            }

            return _mapper.Map<CardPositionPerRoomDto>(cardPositionPerRoom);
        }

        public async Task<CardPositionPerRoomDto> CreateDtoAsync(CardPositionPerRoomDto dto)
        {
            CardPositionPerRoom cardPositionPerRoom = _mapper.Map<CardPositionPerRoom>(dto);
            cardPositionPerRoom = await _cardPositionPerRoomService.CreateAsync(cardPositionPerRoom);
            return  _mapper.Map<CardPositionPerRoomDto>(cardPositionPerRoom);
        }

        public async Task<bool> UpdateDtoAsync(string id, CardPositionPerRoomDto dto)
        {
            if (!Exists(id))
            {
                return false;
            }

            CardPositionPerRoom cardPositionPerRoom = _mapper.Map<CardPositionPerRoom>(dto);
            bool updated = await _cardPositionPerRoomService.UpdateAsync(cardPositionPerRoom.CardPositionPerRoomId, cardPositionPerRoom);

            return updated;
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            if (!Exists(id)) {
                return false;
            }

            bool deleted = await _cardPositionPerRoomService.DeleteNavAsync(DtoIdConversion.DtoStringToLong(id));

            return deleted;
        }

        public async Task<CardPositionPerRoomDto?> GetDtoNavAsync(string id)
        {
            CardPositionPerRoom? cardPositionPerRoom = await _cardPositionPerRoomService.GetNavAsync(DtoIdConversion.DtoStringToLong(id));

            if (cardPositionPerRoom == null)
            {
                return null;
            }

            return _mapper.Map<CardPositionPerRoomDto>(cardPositionPerRoom);
        }

        public async Task<CardPositionPerRoomDto> CreateDtoNavAsync(CardPositionPerRoomDto dto)
        {
            CardPositionPerRoom cardPositionPerRoom = _mapper.Map<CardPositionPerRoom>(dto);
            cardPositionPerRoom = await _cardPositionPerRoomService.CreateNavAsync(cardPositionPerRoom);
            return  _mapper.Map<CardPositionPerRoomDto>(cardPositionPerRoom);
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardPositionPerRoomDto dto)
        {
            if (!Exists(id))
            {
                return false;
            }

            CardPositionPerRoom cardPositionPerRoom = _mapper.Map<CardPositionPerRoom>(dto);
            bool updated = await _cardPositionPerRoomService.UpdateNavAsync(cardPositionPerRoom);

            return updated;
        }

        public async Task<bool> UpdateAllDtoNavAsync(CardPositionPerRoomDto[] cardPositionPerRoomDtos)
        {
           return await _cardPositionPerRoomService.UpdateAllNavAsync(_mapper.Map<CardPositionPerRoom[]>(cardPositionPerRoomDtos));
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            if (!Exists(id)) {
                return false;
            }

            bool deleted = await _cardPositionPerRoomService.DeleteNavAsync(DtoIdConversion.DtoStringToLong(id));

            return deleted;
        }

        public async Task<IEnumerable<CardPositionPerRoomDto>> GetAllDtoNavByRoomIdAsync(string gameRoomId)
        {
            return _mapper.Map<IEnumerable<CardPositionPerRoomDto>>(await _cardPositionPerRoomService.GetAllNavByRoomIdAsync(DtoIdConversion.DtoStringToLong(gameRoomId)));
        }
    }
}