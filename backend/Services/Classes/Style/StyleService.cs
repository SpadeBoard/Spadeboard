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
        private readonly ApplicationDbContext _context = context;

        public Task CreateAsync(Style item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(long id)
        {
            throw new NotImplementedException();
        }

        public bool Exists(long id)
        {
            return _context.Style.Any(s => s.StyleId == id);
        }

        public Task<IEnumerable<Style>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Style?> GetAsync(long id)
        {
            throw new NotImplementedException();
        }

        public bool IsModified(Style item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }

        public Task<bool> UpdateAsync(long id, Style item)
        {
            throw new NotImplementedException();
        }
    }
}