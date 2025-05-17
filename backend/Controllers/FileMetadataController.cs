using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Services;
using Models.Files;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileMetadataController(IFileMetadataDtoService fileMetadataDtoService) : ControllerBase
    {
        private readonly IFileMetadataDtoService _fileMetadataDtoService = fileMetadataDtoService;
    
                [HttpGet]
        public async Task<ActionResult<IEnumerable<FileMetadataDto>>> GetFileMetadata()
        {
            var filesMetadata = await _fileMetadataDtoService.GetAllDtoAsync();

            if (filesMetadata == null)
            {
                return NotFound();
            }

            return Ok(filesMetadata);
        }

        // GET: api/Cards/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FileMetadataDto>> GetFileMetadata(string id)
        {
            var fileMetadata = await _fileMetadataDtoService.GetDtoAsync(id);

            if (fileMetadata == null)
            {
                return NotFound();
            }

            return fileMetadata;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutFileMetadata(string id, FileMetadataDto item)
        {
            var result = await _fileMetadataDtoService.UpdateDtoAsync(id,  item);

            if (result == true)
                return NoContent();

            // Could be either bad request or not found, you may want to distinguish these
            if (id !=  item.FileMetadataId)
                return BadRequest();

            return NotFound();
        }

        [HttpPost]
        public async Task<ActionResult<FileMetadataDto>> PostCard(FileMetadataDto item)
        {
            FileMetadataDto newItem= await _fileMetadataDtoService.CreateDtoAsync(item);
            return CreatedAtAction("GetFileMetadata", new { id = newItem.FileMetadataId }, newItem);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCard(string id)
        {
            var deleted = await _fileMetadataDtoService.DeleteDtoAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}