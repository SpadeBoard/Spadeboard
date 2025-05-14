using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using Models.DndItems;
using AutoMapper;
using Utils;


namespace Services
{
    public class DndItemDtoService : IDndItemDtoService
    {
        private readonly IMapper _mapper;
        private readonly IDndItemService _dndItemService;
         private readonly DtoCrudService<DndItem, DndItemDto> _dtoCrudService;

        public DndItemDtoService(IMapper mapper, IDndItemService dndItemService)
        {
             _mapper = mapper;
            _dndItemService = dndItemService;
            _dtoCrudService = new(_mapper, _dndItemService);
        }
    
        public async Task<DndItemDto> CreateDtoAsync(DndItemDto dndItemDto)
        {
            return await _dtoCrudService.CreateDtoAsync(dndItemDto);
        }
        
        public async Task<DndItemDto?> GetDtoAsync(string id)
        {
            return  await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, DndItemDto dndItemDto)
        {
            return await _dtoCrudService.UpdateDtoAsync(id, dndItemDto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public async Task<DndItemDto> CreateDtoNavAsync(DndItemDto dndItemDto)
        {
            throw new NotImplementedException();
        }
        
        public async Task<DndItemDto?> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, DndItemDto dndItemDto)
        {
           throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<DndItemDto>> GetAllDtoAsync() 
        {
           return  await _dtoCrudService.GetAllDtoAsync();
        }

         public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }
    }
}