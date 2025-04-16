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
    public class CardFacesController(ICardFaceService cardFaceService) : ControllerBase
    {
        private readonly ICardFaceService _cardFaceService = cardFaceService;

        // GET: api/CardFaces
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CardFace>>> GetCardFace()
        {
            var cardFaces = await _cardFaceService.GetAllAsync();

            if (cardFaces == null)
            {
                return NotFound();
            }

            return Ok(cardFaces);
        }

        // GET: api/CardFaces/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardFace>> GetCardFace(int id)
        {
            var cardFace = await _cardFaceService.GetAsync(id);

            if (cardFace == null)
            {
                return NotFound();
            }

            return cardFace;
        }

        [HttpGet("dto/{id}")]
        public async Task<ActionResult<CardFace>> GetCardFaceDto(int id)
        {
            var cardFace = await _cardFaceService.GetNavAsync(id);

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
            var result = await _cardFaceService.UpdateAsync(id, cardFace);

            if (result == true)
                return NoContent();

            // Could be either bad request or not found, you may want to distinguish these
            if (id != cardFace.CardFaceId)
                return BadRequest();

            return NotFound();
        }

        // POST: api/CardFaces
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CardFace>> PostCardFace(CardFace cardFace)
        {
            await _cardFaceService.CreateAsync(cardFace);
            return CreatedAtAction("GetCardFace", new { id = cardFace.CardFaceId }, cardFace);
        }

        // DELETE: api/CardFaces/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCardFace(int id)
        {
            var deleted = await _cardFaceService.DeleteAsync(id);
            if (deleted == false)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
