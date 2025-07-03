using Data;
using Models.Bridge;
using Microsoft.EntityFrameworkCore;
using Models.Tags;

namespace Services
{
    public class TagsPerCardService(ApplicationDbContext context, ITagService tagService): ITagsPerCardService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly CrudService<TagsPerCard> _crudService = new(context, tpc => tpc.TagsPerCardId);
        private readonly ITagService _tagService = tagService;
        public async Task<TagsPerCard> CreateAsync(TagsPerCard item)
        {
            return await _crudService.CreateAsync(item);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }

        public bool Exists(long id)
        {
            return _crudService.Exists(id);
        }

        public bool IsModified(TagsPerCard item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<TagsPerCard>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<TagsPerCard?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, TagsPerCard item)
        {
            return await _crudService.UpdateAsync(id, item);
        }

        public async Task<IEnumerable<String>> GetTagNamesByCardIdAsync(long cardId)
        {
            return await _context.TagsPerCard
                .Where(tpc => tpc.Card.CardId == cardId)
                .Select(tpc => tpc.Tag.TagName)
                .ToListAsync();
        }

        public async Task<bool> DeleteByTagNameAndCardIdAsync(string tagName, long cardId) {
            TagsPerCard? tpc = await _context.TagsPerCard.FirstOrDefaultAsync(t => t.Tag.TagName == tagName && t.Card.CardId == cardId);

            if (tpc == null)
                return false;
            
            _context.TagsPerCard.Remove(tpc);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<TagsPerCard> CreateByTagNameAndCardIdAsync(string tagName, long cardId) {
            Tag? tag = await _tagService.GetTagByTagNameAsync(tagName);

            // NOTE: This is to make sure importing works because we'll eventually get rid of unused tags for space
            if (tag == null)
            {
                tag = new Tag
                {
                    TagId = 0,
                    TagName = tagName
                };

                tag = await _tagService.CreateAsync(tag);
            }

            TagsPerCard tpc = new()
            {
                TagsPerCardId = 0,
                TagId = tag.TagId,
                CardId = cardId
            };

            return await CreateAsync(tpc);
        }
    }
}