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
    public class DndItemDtoService(IMapper mapper, IDndItemService dndItemService) : IDndItemDtoService
    {
        private readonly IMapper _mapper = mapper;
        private readonly IDndItemService _dndItemService = dndItemService;
    
        public async Task<DndItemDto> CreateDtoAsync(DndItemDto dndItemDto)
        {
            DndItem dndItem= _mapper.Map<DndItem>(dndItemDto);
            await _dndItemService.CreateAsync(dndItem);
            return  _mapper.Map<DndItemDto>(dndItem);
        }
        
        public async Task<DndItemDto?> GetDtoAsync(string id)
        {
            if (!Exists(id)) {
                return null;
            }

            DndItem? dndItem= await _dndItemService.GetAsync(DtoIdConversion.DtoStringToLong(id));

            if (dndItem== null)
            {
                return null;
            }

            return _mapper.Map<DndItemDto>(dndItem);
        }

        public async Task<bool> UpdateDtoAsync(string id, DndItemDto dndItemDto)
        {
            if (!Exists(id)) {
                return false;
            }

            DndItem dndItem = _mapper.Map<DndItem>(dndItemDto);
            bool updated = await _dndItemService.UpdateAsync(dndItem.DndItemId, dndItem);

            return updated;
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            if (!Exists(id)) {
                return false;
            }

            bool deleted = await _dndItemService.DeleteAsync(DtoIdConversion.DtoStringToLong(id));

            return deleted;
        }

        public Task<DndItemDto> CreateDtoNavAsync(DndItemDto dndItemDto)
        {
            throw new NotImplementedException();
        }
        
        public Task<DndItemDto?> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateDtoNavAsync(string id, DndItemDto dndItemDto)
        {
           throw new NotImplementedException();
        }

        public Task<bool> DeleteDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<DndItemDto>> GetAllDtoAsync() 
        {
            return _mapper.Map<IEnumerable<DndItemDto>>(await _dndItemService.GetAllAsync());
        }

         public bool Exists(string id)
        {
            return _dndItemService.Exists(DtoIdConversion.DtoStringToLong(id));
        }
    }
}