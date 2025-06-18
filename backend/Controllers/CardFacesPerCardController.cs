using Microsoft.AspNetCore.Mvc;
using Models.Cards;
using Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardFacesPerCardController(ICardFacePerCardDtoService cardFacePerCardDtoService): ControllerBase
    {
        private readonly ICardFacePerCardDtoService _cardFacePerCardDtoService = cardFacePerCardDtoService;
    
        [HttpGet("card/{cardId}")]
        public async Task<ActionResult<IEnumerable<CardFaceDto>>> GetCardFacesPerCard(string cardId)
        {
            return (await _cardFacePerCardDtoService.GetAllFacesDtoByCardId(cardId)).ToList();
        }
    }
}