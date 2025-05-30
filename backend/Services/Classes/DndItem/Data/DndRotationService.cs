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
    public class DndRotationService(ApplicationDbContext context) : IDndRotationService
    {
        private readonly CrudService<DndRotation> _crudService = new(context, dndRotation=> dndRotation.DndRotationId);

        public async Task<DndRotation> CreateAsync(DndRotation item)
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

        public bool IsModified(DndRotation item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<DndRotation>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<DndRotation?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, DndRotation item)
        {
            return await _crudService.UpdateAsync(id, item);
        }
    }
}