using Microsoft.AspNetCore.Mvc;
using Services;
using Models.Bridge;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileAuthenticationPerExportedCardController(IFileAuthenticationPerExportedCardDtoService fileAuthenticationPerExportedCardDtoService) : ControllerBase
    {
        private readonly IFileAuthenticationPerExportedCardDtoService _fileAuthenticationPerExportedCardDtoService = fileAuthenticationPerExportedCardDtoService;

        // TODO: Have a post and delete function only, you compute the hash in the controller then send it into the service?
        [HttpPost]
        public async Task<ActionResult<FileAuthenticationPerExportedCardDto>> PostCard(FileAuthenticationPerExportedCardDto item)
        {
            FileAuthenticationPerExportedCardDto newItem= await _fileAuthenticationPerExportedCardDtoService.CreateDtoAsync(item);
            return CreatedAtAction("GetFileAuthenticationPerExportedCard", new { id = newItem.FileAuthenticationPerExportedCardId }, newItem);
        }
    }
}