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
        private readonly ApplicationDbContext _context = context;

        public bool Exists(long id)
        {
            return _context.DndItem.Any(d => d.DndItemId == id);
        }

        public async Task<IEnumerable<DndItem>> GetAllAsync()
        {
            return await _context.DndItem.ToListAsync(); 
        }

        public async Task<DndItem?> GetAsync(long id)
        {
            return await _context.DndItem.FirstOrDefaultAsync(dnd => dnd.DndItemId == id);
        }

        public async Task<DndItem> CreateAsync(DndItem item)
        {
            item.DndItemId = 0;
            await _context.DndItem.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> UpdateAsync(long id, DndItem item)
        {
            if (id != item.DndItemId)
            {
                return false;
            }

            try
            {
                _context.Entry(item).State = EntityState.Modified;

                return await _context.SaveChangesAsync() > 0;
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

        public async Task<bool> DeleteAsync(long id)
        {
            var dndItem = await GetAsync(id);
            if (dndItem == null)
            {
                return false;
            }

            _context.DndItem.Remove(dndItem);
            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public bool IsModified(DndItem item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }
    }
}