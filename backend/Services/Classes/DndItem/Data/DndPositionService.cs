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
    public class DndPositionService(ApplicationDbContext context) : IDndPositionService
    {
        private readonly CrudService<DndPosition> _crudService = new(context, dndPosition => dndPosition.DndPositionId);

        public async Task<DndPosition> CreateAsync(DndPosition item)
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

        public bool IsModified(DndPosition item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<DndPosition>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<DndPosition?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, DndPosition item)
        {
            return await _crudService.UpdateAsync(id, item);
        }
    }
}