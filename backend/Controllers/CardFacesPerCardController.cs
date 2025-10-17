using Microsoft.AspNetCore.Mvc;
using Models.Cards;
using Services;
using Utils;

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


        [HttpGet("card/{cardId}/{lod}")]
        public async Task<IActionResult> GetCardFacesByLodAsync(string cardId, int lod)
        {
            IEnumerable<FileStream> files = await _cardFacePerCardDtoService.GetCardFacesByLodDtoAsync(cardId, lod);

            if (files == null || !files.Any())
            {
                Console.WriteLine("Null or empty file list");
                return BadRequest();
            }

            string zipName = $"CardFacesLod{lod}-{DateTime.UtcNow:yyyyMMddHHmmss}.zip";

            try
            {
                MemoryStream ms = await ZipArchiveFunctionality.Zip(files);
                return File(ms, "application/zip", zipName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex);
            }
        }
    }
}