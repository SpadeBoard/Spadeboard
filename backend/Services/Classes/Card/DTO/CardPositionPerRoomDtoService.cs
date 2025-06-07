using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Models.Bridge;
using AutoMapper;
using Utils;

namespace Services
{
    public class CardPositionPerRoomDtoService: ICardPositionPerRoomDtoService
    {
        private readonly ICardPositionPerRoomService _cardPositionPerRoomService;
        private readonly IMapper _mapper;
        private readonly DtoCrudService<CardPositionPerRoom, CardPositionPerRoomDto> _dtoCrudService;

        private readonly DtoNavCrudService<CardPositionPerRoom, CardPositionPerRoomDto> _dtoNavCrudService;

        public CardPositionPerRoomDtoService(ICardPositionPerRoomService cardPositionPerRoomService, IMapper mapper)
        {
            _mapper = mapper;
            _cardPositionPerRoomService = cardPositionPerRoomService;
             _dtoCrudService = new(_mapper, _cardPositionPerRoomService);
             _dtoNavCrudService = new(_mapper, _cardPositionPerRoomService);
        }

        public bool Exists(string id)
        {
           return _dtoCrudService.Exists(id);
        }

        public async Task<IEnumerable<CardPositionPerRoomDto>> GetAllDtoAsync()
        {
            return  await _dtoCrudService.GetAllDtoAsync();
        }

        public async Task<CardPositionPerRoomDto?> GetDtoAsync(string id)
        {
             return  await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<CardPositionPerRoomDto> CreateDtoAsync(CardPositionPerRoomDto dto)
        {
           return await _dtoCrudService.CreateDtoAsync(dto);
        }

        public async Task<bool> UpdateDtoAsync(string id, CardPositionPerRoomDto dto)
        {
           return await _dtoCrudService.UpdateDtoAsync(id, dto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
             return await _dtoCrudService.DeleteDtoAsync(id);
        }

         public async Task<IEnumerable<CardPositionPerRoomDto>> GetAllDtoNavAsync()
        {
            return  await _dtoNavCrudService.GetAllDtoNavAsync();
        }

        public async Task<CardPositionPerRoomDto?> GetDtoNavAsync(string id)
        {
           return await _dtoNavCrudService.GetDtoNavAsync(id);
        }

        public async Task<CardPositionPerRoomDto> CreateDtoNavAsync(CardPositionPerRoomDto dto)
        {
           return await _dtoNavCrudService.CreateDtoNavAsync(dto);
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardPositionPerRoomDto dto)
        {
           return await _dtoNavCrudService.UpdateDtoNavAsync(id, dto);
        }

        public async Task<bool> UpdateAllDtoNavAsync(CardPositionPerRoomDto[] cardPositionPerRoomDtos)
        {
           return await _cardPositionPerRoomService.UpdateAllNavAsync(_mapper.Map<CardPositionPerRoom[]>(cardPositionPerRoomDtos));
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
           return await _dtoNavCrudService.DeleteDtoNavAsync(id);
        }

        public async Task<IEnumerable<CardPositionPerRoomDto>> GetAllDtoNavByRoomIdAsync(string gameRoomId)
        {
            return _mapper.Map<IEnumerable<CardPositionPerRoomDto>>(await _cardPositionPerRoomService.GetAllNavByRoomIdAsync(DtoIdConversion.DtoStringToLong(gameRoomId)));
        }

        public async Task<CardPositionPerRoomDto?> GetDtoByCardIdAsync(string cardId) {
            return  _mapper.Map<CardPositionPerRoomDto?>(await _cardPositionPerRoomService.GetByCardIdAsync(DtoIdConversion.DtoStringToLong(cardId)));
        }
    }
}