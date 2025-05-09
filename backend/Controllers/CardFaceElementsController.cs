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
    public class CardFaceElementsController(ICardFaceElementDtoService cardFaceElementDtoService, ICardFaceElementPerCardFaceDtoService cardFaceElementPerCardFaceDtoService) : ControllerBase
    {
        private readonly ICardFaceElementDtoService _cardFaceElementDtoService = cardFaceElementDtoService;

        private readonly ICardFaceElementPerCardFaceDtoService _cardFaceElementPerCardFaceDtoService = cardFaceElementPerCardFaceDtoService;

        // GET: api/CardFaceElements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CardFaceElementDto>>> GetCardFaceElement()
        {
            var cardFaceElements = await _cardFaceElementDtoService.GetAllDtoAsync();

            if (cardFaceElements == null)
            {
                return NotFound();
            }

            return Ok(cardFaceElements);
        }

        // GET: api/CardFaceElements/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardFaceElementDto>> GetCardFaceElement(string id)
        {
            var cardFaceElement = await _cardFaceElementDtoService.GetDtoAsync(id);

            if (cardFaceElement == null)
            {
                return NotFound();
            }

            return cardFaceElement;
        }

        [HttpGet("nav/{id}")]
        public async Task<ActionResult<CardFaceElementDto>> GetCardFaceElementNav(string id)
        {
            var cardFaceElement = await _cardFaceElementDtoService.GetDtoNavAsync(id);

            if (cardFaceElement == null)
            {
                return NotFound();
            }

            return cardFaceElement;
        }

        // PUT: api/CardFaceElements/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCardFaceElement(string id, CardFaceElementDto cardFaceElement)
        {
            var result = await _cardFaceElementDtoService.UpdateDtoAsync(id, cardFaceElement);

            if (result == true)
                return NoContent();

            // Could be either bad request or not found, you may want to distinguish these
            if (id != cardFaceElement.CardFaceElementId)
                return BadRequest();

            return NotFound();
        }

        // POST: api/CardFaceElements
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CardFaceElementDto>> PostCardFaceElement(CardFaceElementDto cardFaceElement)
        {
            cardFaceElement = await _cardFaceElementDtoService.CreateDtoAsync(cardFaceElement);
            return CreatedAtAction("GetCardFaceElement", new { id = cardFaceElement.CardFaceElementId }, cardFaceElement);
        }

        // DELETE: api/CardFaceElements/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCardFaceElement(string id)
        {
            var deleted = await _cardFaceElementDtoService.DeleteDtoAsync(id);
            if (deleted == false)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("nav/{id}")]
        public async Task<IActionResult> DeleteCardFaceElementNav(string id)
        {
            var deleted = await _cardFaceElementDtoService.DeleteDtoNavAsync(id);
            if (deleted == false)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("nav/card-face-element-per-card-face/{id}")]
        public async Task<IActionResult> DeleteCardFaceElementPerCardFaceNav(string id)
        {
            var deleted = await _cardFaceElementPerCardFaceDtoService.DeleteDtoNavAsync(id);
            if (deleted == false)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
