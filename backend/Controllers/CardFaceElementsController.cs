using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Services;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardFaceElementsController(ApplicationDbContext context, ICardFaceElementService cardFaceElementService) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICardFaceElementService _cardFaceElementService = cardFaceElementService;

        // GET: api/CardFaceElements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CardFaceElement>>> GetCardFaceElement()
        {
            var cardFaceElements = await _cardFaceElementService.GetCardFaceElementsAsync();

            if (cardFaceElements == null)
            {
                return NotFound();
            }

            return Ok(cardFaceElements);
        }

        [HttpGet("CardFace/{id}")]
        public async Task<ActionResult<IEnumerable<CardFaceElement>>> GetCardFaceElementsByCardFaceId(int id)
        {
            var cardFaceElements = await _cardFaceElementService.GetCardFaceElementsByCardFaceId(id);

            if (cardFaceElements == null)
            {
                return NotFound();
            }

            return Ok(cardFaceElements);
        }

        [HttpGet("CardFace/dto/{id}")]
        public async Task<ActionResult<IEnumerable<CardFaceElement>>> GetCardFaceElementsDtoByCardFaceId(int id)
        {
            var cardFaceElements = await _cardFaceElementService.GetCardFaceElementsDtoByCardFaceId(id);

            if (cardFaceElements == null)
            {
                return NotFound();
            }

            return Ok(cardFaceElements);
        }

        // GET: api/CardFaceElements/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardFaceElement>> GetCardFaceElement(int id)
        {
            var cardFaceElement = await _cardFaceElementService.GetCardFaceElementAsync(id);

            if (cardFaceElement == null)
            {
                return NotFound();
            }

            return cardFaceElement;
        }

        // PUT: api/CardFaceElements/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCardFaceElement(int id, CardFaceElement cardFaceElement)
        {
            if (id != cardFaceElement.CardFaceElementId)
            {
                return BadRequest();
            }

            _context.Entry(cardFaceElement).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CardFaceElementExists(id))
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

        // POST: api/CardFaceElements
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CardFaceElement>> PostCardFaceElement(CardFaceElement cardFaceElement)
        {
            _context.CardFaceElement.Add(cardFaceElement);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCardFaceElement", new { id = cardFaceElement.CardFaceElementId }, cardFaceElement);
        }

        // DELETE: api/CardFaceElements/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCardFaceElement(int id)
        {
            var cardFaceElement = await _cardFaceElementService.GetCardFaceElementAsync(id);
            if (cardFaceElement == null)
            {
                return NotFound();
            }

            _context.CardFaceElement.Remove(cardFaceElement);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CardFaceElementExists(int id)
        {
            return _cardFaceElementService.Exists(id);
        }
    }
}
