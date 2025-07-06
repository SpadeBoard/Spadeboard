using Microsoft.AspNetCore.Mvc;
using Models.Bridge;
using Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TagsPerCardController(ITagsPerCardDtoService tagsPerCardDtoService): ControllerBase
    {
        private readonly ITagsPerCardDtoService _tagsPerCardDtoService = tagsPerCardDtoService;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TagsPerCardDto>>> GetTag()
        {
             var items = await _tagsPerCardDtoService .GetAllDtoAsync();

            if (items== null)
            {
                return NotFound();
            }

            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TagsPerCardDto>> GetTag(string id)
        {
            var item = await _tagsPerCardDtoService.GetDtoAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            return item;
        }

        [HttpGet("tag-names-by-card-id/{cardId}")]
        public async Task<ActionResult<IEnumerable<String>>> GetTagNamesByCardId(string cardId)
        {
            var items = await _tagsPerCardDtoService.GetTagNamesByCardIdDtoAsync(cardId);

            if (items == null)
            {
                return NotFound();
            }

             return Ok(items);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTag(string id, TagsPerCardDto item)
        {
            var result = await _tagsPerCardDtoService.UpdateDtoAsync(id, item);

            if (result == true)
                return NoContent();

            // Could be either bad request or not found, you may want to distinguish these
            if (id != item.TagId)
                return BadRequest();

            return NotFound();
        }

        [HttpPost]
        public async Task<ActionResult<TagsPerCardDto>> PostTag(TagsPerCardDto item)
        {
            TagsPerCardDto newItem= await _tagsPerCardDtoService.CreateDtoAsync(item);
            return CreatedAtAction("GetTagPerCard", new { id = newItem.TagId }, newItem);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTag(string id)
        {
            var deleted = await _tagsPerCardDtoService.DeleteDtoAsync(id);
            return deleted ? NoContent() : NotFound();
        }

        [HttpDelete("{tagName}/{cardId}")]
        public async Task<IActionResult> DeleteByTagNameAndCardId(string tagName, string cardId)
        {
            bool deleted = await _tagsPerCardDtoService.DeleteByTagNameAndCardIdDtoAsync(tagName, cardId);
            return deleted ? NoContent() : NotFound();
        }

        [HttpDelete("tag-names/{cardId}")]
        public async Task<IActionResult> DeleteByTagNamesAndCardId([FromQuery] string[] tagNames, string cardId)
        {
            bool deleted = await _tagsPerCardDtoService.DeleteByTagNamesAndCardIdDtoAsync(tagNames, cardId);
            return deleted ? NoContent() : NotFound();
        }
    }
}