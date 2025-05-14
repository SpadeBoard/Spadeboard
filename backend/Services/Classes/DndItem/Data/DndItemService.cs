using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.DndItems;
using Models.Cards;
using Models.Bridge;

namespace Services
{
    public class DndItemService(ApplicationDbContext context) : IDndItemService
    {
        private readonly CrudService<DndItem> _crudService = new(context, dndItem => dndItem.DndItemId);

        public async Task<DndItem> CreateAsync(DndItem item)
        {
            return await _crudService.CreateAsync(item);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }

        public bool Exists(long id)
        {
            return _crudService.Exists(id);
        }

        public bool IsModified(DndItem item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<DndItem>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<DndItem?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, DndItem item)
        {
            return await _crudService.UpdateAsync(id, item);
        }
    }
}