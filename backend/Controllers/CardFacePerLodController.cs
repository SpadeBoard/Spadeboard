using Microsoft.AspNetCore.Mvc;
using Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardFacePerLodController(ICardFacePerLodDtoService cardFacePerLodDtoService) : ControllerBase
    {
        private readonly ICardFacePerLodDtoService _cardFacePerLodDtoService = cardFacePerLodDtoService;

        [HttpGet("card-face/{cardFaceId}")]
        public async Task<ActionResult<IEnumerable<string>>>GetFileMetadataFileNamesByCardFace(string cardFaceId)
        {
            return Ok( await _cardFacePerLodDtoService.GetFileMetadataFileNamesByCardFaceDto(cardFaceId));
        }
    }
}