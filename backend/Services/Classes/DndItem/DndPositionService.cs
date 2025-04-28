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

        public async Task CreateAsync(DndPosition item)
        {
            item.DndPositionId = 0;
            await _context.DndPosition.AddAsync(item);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var dndPosition= await GetAsync(id);
            if (dndPosition== null)
            {
                return false;
            }

            _context.DndPosition.Remove(dndPosition);
            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public bool Exists(int id)
        {
            return _context.DndPosition.Any(p => p.DndPositionId == id);
        }

        public bool IsModified(DndPosition item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }

        public async Task<IEnumerable<DndPosition>> GetAllAsync()
        {
            return await _context.DndPosition.ToListAsync();
        }

        public async Task<DndPosition?> GetAsync(int id)
        {
            return await _context.DndPosition.FindAsync(id);
        }

        public async Task<bool> UpdateAsync(int id, DndPosition item)
        {
            if (id != item.DndPositionId)
                return false;

            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(id))
                {
                    return false;
                }
                else
                {
                    throw;
                }
            }
        }
    }
}