using Microsoft.AspNetCore.Mvc;
using Data;
using Services;


namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController(IFileUploadService fileUploadService): ControllerBase
    {
        private readonly IFileUploadService _fileUploadService = fileUploadService;

        [HttpGet("card-face/{fileName}")]
        public async Task<IActionResult> GetCardFaceFileAsync(string fileName)
        {
            Console.WriteLine(String.Format("Start of get card face file async: {0}", fileName));

            var file = await _fileUploadService.GetCardFaceFileAsync(fileName);

            if (file == null) 
            {
                Console.WriteLine(String.Format("Null file"));

                return BadRequest();
            }

            // FIXME: Not returning anything in response
            //return Ok(file);
            return File(file, "image/png");
        }

        [HttpPost("card-face")]
        public async Task<ActionResult<string>> UploadCardFaceFileAsync([FromForm] IFormFile formFile)
        {
            var fileName = await _fileUploadService.UploadCardFaceFileAsync(formFile);

            if (fileName == null)
            {
                return BadRequest();
            }

            return Ok(new { id = fileName });
        }

        [HttpGet("card-face-element-image/{fileName}")]
        public async Task<IActionResult> GetCardFaceElementImageAsync(string fileName)
        {
            Console.WriteLine(String.Format("Start of get card face image element file async: {0}", fileName));

            var file = await _fileUploadService.GetCardFaceElementImageFileAsync(fileName);

            if (file == null) 
            {
                Console.WriteLine(String.Format("Null file"));

                return BadRequest();
            }

            // FIXME: Not returning anything in response
            //return Ok(file);
            return File(file, "image/png");
        }

        [HttpPost("card-face-element-image")]
        public async Task<ActionResult<string>> UploadCardFaceElementImageFileAsync([FromForm] IFormFile formFile)
        {
            var fileName = await _fileUploadService.UploadCardFaceElementImageFileAsync(formFile);

            if (fileName == null)
            {
                return BadRequest();
            }

            return Ok(new { id = fileName });
        }

        [HttpPut("card-face/{fileName}")]
        public async Task<ActionResult<string>> ReplaceCardFaceFileAsync(string fileName, [FromForm] IFormFile formFile)
        {
            var replaced = await _fileUploadService.ReplaceCardFaceFileAsync(formFile, fileName);
            return replaced ? Ok(new { id = fileName }) : BadRequest();
        }

        [HttpPut("card-face-element-image/{fileName}")]
        public async Task<ActionResult<string>> ReplaceCardFaceElementImageFileAsync(string fileName, [FromForm] IFormFile formFile)
        {
            var replaced = await _fileUploadService.ReplaceCardFaceElementImageFileAsync(formFile, fileName);
            return replaced ? Ok(new { id = fileName }) : BadRequest();
        }
    }
}