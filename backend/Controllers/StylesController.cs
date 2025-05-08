using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Styles;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StylesController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        // GET: api/Styles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Style>>> GetStyle()
        {
            return await _context.Style.ToListAsync();
        }

        // GET: api/Styles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Style>> GetStyle(long id)
        {
            var style = await _context.Style.FindAsync(id);

            if (style == null)
            {
                return NotFound();
            }

            return style;
        }

        // PUT: api/Styles/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStyle(long id, Style style)
        {
            if (id != style.StyleId)
            {
                return BadRequest();
            }

            _context.Entry(style).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StyleExists(id))
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

        // POST: api/Styles
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Style>> PostStyle(Style style)
        {
            _context.Style.Add(style);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetStyle", new { id = style.StyleId }, style);
        }

        // DELETE: api/Styles/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStyle(long id)
        {
            var style = await _context.Style.FindAsync(id);
            if (style == null)
            {
                return NotFound();
            }

            _context.Style.Remove(style);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StyleExists(long id)
        {
            return _context.Style.Any(e => e.StyleId == id);
        }
    }
}
