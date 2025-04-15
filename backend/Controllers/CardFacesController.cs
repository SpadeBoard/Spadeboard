using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using Services;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardFacesController(ApplicationDbContext context, ICardFaceService cardFaceService) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        private readonly ICardFaceService _cardFaceService = cardFaceService;

        // GET: api/CardFaces
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CardFace>>> GetCardFace()
        {
            return await _context.CardFace.ToListAsync();
        }

        // GET: api/CardFaces/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardFace>> GetCardFace(int id)
        {
            var cardFace = await _context.CardFace.FindAsync(id);

            if (cardFace == null)
            {
                return NotFound();
            }

            return cardFace;
        }

        [HttpGet("dto/{id}")]
        public async Task<ActionResult<CardFace>> GetCardFaceDto(int id)
        {
            var cardFace = await _cardFaceService.GetCardFaceNavAsync(id);

            if (cardFace == null)
            {
                return NotFound();
            }

            return cardFace;
        }

        // PUT: api/CardFaces/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCardFace(int id, CardFace cardFace)
        {
            if (id != cardFace.CardFaceId)
            {
                return BadRequest();
            }

            _context.Entry(cardFace).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CardFaceExists(id))
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

        // POST: api/CardFaces
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CardFace>> PostCardFace(CardFace cardFace)
        {
            _context.CardFace.Add(cardFace);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCardFace", new { id = cardFace.CardFaceId }, cardFace);
        }

        // DELETE: api/CardFaces/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCardFace(int id)
        {
            var cardFace = await _context.CardFace.FindAsync(id);
            if (cardFace == null)
            {
                return NotFound();
            }

            _context.CardFace.Remove(cardFace);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // TODO: Replace with the service
        private bool CardFaceExists(int id)
        {
            return _context.CardFace.Any(e => e.CardFaceId == id);
        }
    }
}
