using Microsoft.AspNetCore.Mvc;
using Models.Cards;
using Services;
using Models.Bridge;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardsController(ICardDtoService cardDtoService, ICardPerOwnerDtoService cardPerOwnerDtoService) : ControllerBase
    {
        private readonly ICardDtoService _cardDtoService = cardDtoService;

        private readonly ICardPerOwnerDtoService _cardPerOwnerDtoService = cardPerOwnerDtoService;
        
        // GET: api/Cards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CardDto>>> GetCard()
        {
            var cards = await _cardDtoService.GetAllDtoAsync();

            if (cards == null)
            {
                return NotFound();
            }

            return Ok(cards);
        }

        // GET: api/Cards/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardDto>> GetCard(string id)
        {
            var card = await _cardDtoService.GetDtoAsync(id);

            if (card == null)
            {
                return NotFound();
            }

            return card;
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<ActionResult<IEnumerable<CardDto>>> GetCardsByOwner(string ownerId)
        {
            return (await _cardPerOwnerDtoService.GetCardsDtoByOwnerIdAsync(ownerId)).ToList();
        }

        [HttpGet("owner/{ownerId}/{cardId}")]
        public async Task<ActionResult<CardDto>> GetCardByOwner(string ownerId, string cardId)
        {
            CardPerOwnerDto? cpo = await _cardPerOwnerDtoService.GetDtoByCardIdAndOwnerIdAsync(cardId, ownerId);

            if (cpo == null)
            {
                return NotFound();
            }

            CardDto? card = await _cardDtoService.GetDtoAsync(cpo.CardId);

            if (card == null)
            {
                return NotFound();
            }

            return Ok(card);
        }

        // PUT: api/Cards/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCard(string id, CardDto card)
        {
            var result = await _cardDtoService.UpdateDtoAsync(id, card);

            if (result == true)
                return NoContent();

            // Could be either bad request or not found, you may want to distinguish these
            if (id != card.CardId)
                return BadRequest();

            return NotFound();
        }

        // POST: api/Cards
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CardDto>> PostCard(CardDto card)
        {
            CardDto newCard= await _cardDtoService.CreateDtoAsync(card);
            return CreatedAtAction("GetCard", new { id = newCard.CardId }, newCard);
        }

        // DELETE: api/Cards/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCard(string id)
        {
            var deleted = await _cardDtoService.DeleteDtoAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
