using Microsoft.AspNetCore.Mvc;
using Models.Tags;
using Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TagsController(ITagDtoService tagDtoService): ControllerBase
    {
        private readonly ITagDtoService _tagDtoService = tagDtoService;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TagDto>>> GetTag()
        {
             var gr = await _tagDtoService.GetAllDtoAsync();

            if (gr== null)
            {
                return NotFound();
            }

            return Ok(gr);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TagDto>> GetTag(string id)
        {
            var tag = await _tagDtoService.GetDtoAsync(id);

            if (tag == null)
            {
                return NotFound();
            }

            return tag;
        }

         [HttpGet("tag-name/{tagName}")]
        public async Task<ActionResult<TagDto>> GetTagByTagName(string tagName)
        {
            var item = await _tagDtoService.GetTagByTagNameDtoAsync(tagName);

            if (item == null)
            {
                return NotFound();
            }

            return item;
        }

        [HttpGet("tag-names")]
        public async Task<ActionResult<IEnumerable<String>>> GetTagNames()
        {
            return Ok(await _tagDtoService.GetTagNamesDtoAsync());
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTag(string id, TagDto tag)
        {
            var result = await _tagDtoService.UpdateDtoAsync(id, tag);

            if (result == true)
                return NoContent();

            // Could be either bad request or not found, you may want to distinguish these
            if (id != tag.TagId)
                return BadRequest();

            return NotFound();
        }

        [HttpPost]
        public async Task<ActionResult<TagDto>> PostTag(TagDto tag)
        {
            TagDto newGameRoom= await _tagDtoService.CreateDtoAsync(tag);
            return CreatedAtAction("GetCard", new { id = newGameRoom.TagId }, newGameRoom);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTag(string id)
        {
            var deleted = await _tagDtoService.DeleteDtoAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}