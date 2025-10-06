using Microsoft.AspNetCore.Mvc;
using System.IO.Compression;
using Services;
using System.Net;
using System.Net.Http.Headers;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController(IFileUploadService fileUploadService) : ControllerBase
    {
        private readonly IFileUploadService _fileUploadService = fileUploadService;

        // https://www.c-sharpcorner.com/article/creating-a-file-zip-functionality-in-asp-net-core-web-api/
        [HttpGet("card-face/lods")]
        public async Task<IActionResult> GetCardFaceFilesAsync([FromQuery] List<string> fileNames)
        {
            List<FileStream> files = (await _fileUploadService.GetCardFaceFilesAsync(fileNames)).ToList();

            if (files == null || files.Count == 0)
            {
                Console.WriteLine("Null or empty file list");
                return BadRequest();
            }

            string zipName = $"CardFaceLods-{DateTime.UtcNow:yyyyMMddHHmmss}.zip";

            try
            {
                // NOTE: Using would automatically dispose it
                /*using*/ MemoryStream? ms = new();
                using ZipArchive? zip = new(ms, ZipArchiveMode.Create, leaveOpen: true);
                foreach (FileStream? file in files)
                {
                    if (file.CanSeek) file.Position = 0;

                    ZipArchiveEntry? entry = zip.CreateEntry(file.Name);
                    
                    using Stream? entryStream = entry.Open();
                    await file.CopyToAsync(entryStream);
                    // await entryStream.FlushAsync();
                }

                // zip.Dispose(); // Explicit disposal to finalize ZIP archive
                ms.Position = 0;

                Console.WriteLine($"Returning ZIP file with length={ms.Length} bytes");
                return File(ms, "application/zip", zipName);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error while creating ZIP: {ex.Message}");
                return StatusCode(500, "Error creating ZIP file");
            }
        }


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

        // TODO: Figure out why there's no preview or response here
        [HttpPost("card-face/lods")]
        public async Task<ActionResult<IEnumerable<string>>> UploadCardFaceFilesAsync([FromForm] List<IFormFile> formFiles)
        {
            var fileNames = await _fileUploadService.UploadCardFaceFilesAsync(formFiles);

            if (fileNames == null)
            {
                return BadRequest();
            }

            return Ok(fileNames);
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

        [HttpPut("card-face-image-path/{srcFileName}")]
        public async Task<ActionResult<string>> ReplaceCardFaceThumbnailImageFilePathAsync(string srcFileName)
        {
            string id = await _fileUploadService.ReplaceCardFaceThumbnailImageFilePathAsync(srcFileName);
            return Ok(new { id });
        }

        [HttpPut("card-face-image-path/batch")]
        public async Task<ActionResult<IEnumerable<string>>> ReplaceCardFaceThumbnailImagesFilePathAsync(string[] srcFileNames)
        {
            return Ok(await _fileUploadService.ReplaceCardFaceThumbnailImagesFilePathAsync(srcFileNames));
        }

        [HttpPut("card-face-element-image-path/{srcFileName}")]
        public async Task<ActionResult<string>> ReplaceCardFaceElementImageFilePathAsync(string srcFileName)
        {
            string id = await _fileUploadService.ReplaceCardFaceElementImageFilePathAsync(srcFileName);
            return Ok(new { id });
        }
    }
}