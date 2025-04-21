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
    public class CardFaceElementsController(ICardFaceElementService cardFaceElementService) : ControllerBase
    {
        private readonly ICardFaceElementService _cardFaceElementService = cardFaceElementService;

        // GET: api/CardFaceElements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CardFaceElement>>> GetCardFaceElement()
        {
            var cardFaceElements = await _cardFaceElementService.GetAllAsync();

            if (cardFaceElements == null)
            {
                return NotFound();
            }

            return Ok(cardFaceElements);
        }

        [HttpGet("CardFace/{id}")]
        public async Task<ActionResult<IEnumerable<CardFaceElement>>> GetAllByCardFaceIdAsync(int id)
        {
            var cardFaceElements = await _cardFaceElementService.GetAllByCardFaceIdAsync(id);

            if (cardFaceElements == null)
            {
                return NotFound();
            }

            return Ok(cardFaceElements);
        }

        [HttpGet("CardFace/nav/{id}")]
        public async Task<ActionResult<IEnumerable<CardFaceElement>>> GetAllNavByCardFaceId(int id)
        {
            var cardFaceElements = await _cardFaceElementService.GetAllNavByCardFaceId(id);

            if (cardFaceElements == null)
            {
                return NotFound();
            }

            return Ok(cardFaceElements);
        }

        [HttpGet("CardFace/dto/{id}")]
        public async Task<ActionResult<IEnumerable<CardFaceElementDto>>> GetCardFaceElementsDtoByCardFaceId(int id)
        {
            var cardFaceElementsDto = await _cardFaceElementService.GetAllDtoByCardFaceIdAsync(id);

            if (cardFaceElementsDto == null)
            {
                return NotFound();
            }

            return Ok(cardFaceElementsDto);
        }

        // GET: api/CardFaceElements/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardFaceElement>> GetCardFaceElement(int id)
        {
            var cardFaceElement = await _cardFaceElementService.GetAsync(id);

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
            var result = await _cardFaceElementService.UpdateAsync(id, cardFaceElement);

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
        public async Task<ActionResult<CardFaceElement>> PostCardFaceElement(CardFaceElement cardFaceElement)
        {
            await _cardFaceElementService.CreateAsync(cardFaceElement);

            return CreatedAtAction("GetCardFaceElement", new { id = cardFaceElement.CardFaceElementId }, cardFaceElement);
        }

        // DELETE: api/CardFaceElements/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCardFaceElement(int id)
        {
            var deleted = await _cardFaceElementService.DeleteAsync(id);
            if (deleted == false)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
