using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.DndItems;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DndItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DndItemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/DndItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DndItem>>> GetDndItem()
        {
            return await _context.DndItem.ToListAsync();
        }

        // GET: api/DndItems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DndItem>> GetDndItem(int id)
        {
            var dndItem = await _context.DndItem.FindAsync(id);

            if (dndItem == null)
            {
                return NotFound();
            }

            return dndItem;
        }

        // PUT: api/DndItems/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDndItem(int id, DndItem dndItem)
        {
            if (id != dndItem.DndItemId)
            {
                return BadRequest();
            }

            _context.Entry(dndItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DndItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/DndItems
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<DndItem>> PostDndItem(DndItem dndItem)
        {
            _context.DndItem.Add(dndItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDndItem", new { id = dndItem.DndItemId }, dndItem);
        }

        // DELETE: api/DndItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDndItem(int id)
        {
            var dndItem = await _context.DndItem.FindAsync(id);
            if (dndItem == null)
            {
                return NotFound();
            }

            _context.DndItem.Remove(dndItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DndItemExists(int id)
        {
            return _context.DndItem.Any(e => e.DndItemId == id);
        }
    }
}
