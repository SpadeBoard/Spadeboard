using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Styles;


namespace Services
{
    public class StyleService(ApplicationDbContext context) : IStyleService
    {
        private readonly CrudService<Style> _crudService = new(context, style => style.StyleId);

        public async Task<Style> CreateAsync(Style item)
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

        public bool IsModified(Style item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<Style>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<Style?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, Style item)
        {
            return await _crudService.UpdateAsync(id, item);
        }
    }
}