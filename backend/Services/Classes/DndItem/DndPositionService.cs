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
        private readonly ApplicationDbContext _context = context;

        public Task CreateAsync(DndPosition item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public bool Exists(int id)
        {
            return _context.DndPosition.Any(p => p.DndPositionId == id);
        }

        public Task<IEnumerable<DndPosition>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<DndPosition?> GetAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(int id, DndPosition item)
        {
            throw new NotImplementedException();
        }
    }
}