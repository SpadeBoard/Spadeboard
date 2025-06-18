using Microsoft.AspNetCore.Mvc;
using Models.Cards;
using Services;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardFacesController(ICardFaceDtoService cardFaceDtoService) : ControllerBase
    {
        private readonly ICardFaceDtoService _cardFaceDtoService = cardFaceDtoService;

        // GET: api/CardFaces
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CardFaceDto>>> GetCardFace()
        {
            var cardFaces = await _cardFaceDtoService.GetAllDtoAsync();

            if (cardFaces == null)
            {
                return NotFound();
            }

            return Ok(cardFaces);
        }

        // GET: api/CardFaces/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardFaceDto>> GetCardFace(string id)
        {
            var cardFace = await _cardFaceDtoService.GetDtoAsync(id);

            if (cardFace == null)
            {
                return NotFound();
            }

            return cardFace;
        }

        [HttpGet("nav/{id}")]
        public async Task<ActionResult<CardFaceDto>> GetCardFaceNav(string id)
        {
            var cardFace = await _cardFaceDtoService.GetDtoNavAsync(id);

            if (cardFace == null)
            {
                return NotFound();
            }

            return cardFace;
        }

        // PUT: api/CardFaces/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCardFace(string id, CardFaceDto cardFace)
        {
            var result = await _cardFaceDtoService.UpdateDtoAsync(id, cardFace);

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
        public async Task<ActionResult<CardFaceDto>> PostCardFace(CardFaceDto cardFace)
        {
            cardFace = await _cardFaceDtoService.CreateDtoAsync(cardFace);
            return CreatedAtAction("GetCardFace", new { id = cardFace.CardFaceId }, cardFace);
        }

        // DELETE: api/CardFaces/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCardFace(string id)
        {
            var deleted = await _cardFaceDtoService.DeleteDtoAsync(id);
            if (deleted == false)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
