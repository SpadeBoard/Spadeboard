using Data;
using Models.Bridge;
using Microsoft.EntityFrameworkCore;
using Models.Tags;
using Models.Cards;
using System.Linq;

namespace Services
{
    public class TagsPerCardService(ApplicationDbContext context, ITagService tagService, ICardPerOwnerService cardPerOwnerService): ITagsPerCardService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly CrudService<TagsPerCard> _crudService = new(context, tpc => tpc.TagsPerCardId);
        private readonly ITagService _tagService = tagService;
        private readonly ICardPerOwnerService _cardPerOwnerService = cardPerOwnerService;

        public async Task<TagsPerCard> CreateAsync(TagsPerCard item)
        {
            return await _crudService.CreateAsync(item);
        }

        // TODO: Potentially work on figure out how to actually update tags
        // Because of the fact we're creating new records, the tags will always reload out of original order from when we made it

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
                .Where(tpc => tpc.CardId == cardId)
                .Select(tpc => tpc.Tag!.TagName)
                .ToListAsync();
        }
        
        // TODO: Make this inside of the corresponding DTO
        public async Task<IEnumerable<long>> GetTemplateCardIdsAsync()
        {
            return await _context.TagsPerCard
                .Where(tpc => EF.Functions.ILike(tpc.Tag.TagName, "template"))
                .Select(tpc => tpc.Card!.CardId)
                .Distinct()
                .ToListAsync();
        }

        public async Task<bool> IsCardTemplateAsync(long cardId) {
            TagsPerCard? tpc = await _context.TagsPerCard
                .FirstOrDefaultAsync(tpc => EF.Functions.ILike(tpc.Tag.TagName, "template") && tpc.Card.CardId == cardId);

            return tpc != null;
        }

        public async Task<TagsPerCard?> GetByTagNameAndCardIdAsync(string tagName, long cardId)
        {
            return await _context.TagsPerCard
                .FirstOrDefaultAsync(tpc => tpc.Card.CardId == cardId && tpc.Tag.TagName == tagName);
        }

        public async Task<bool> DeleteByTagNamesAndCardIdAsync(string[] tagNames, long cardId) {
            foreach (string tagName in tagNames) {
                await DeleteByTagNameAndCardIdAsync(tagName, cardId);
            }

            return true;
        }

        public async Task<bool> DeleteByTagNameAndCardIdAsync(string tagName, long cardId) {
            TagsPerCard? tpc = await _context.TagsPerCard.FirstOrDefaultAsync(t => t.Tag.TagName == tagName && t.Card.CardId == cardId);

            if (tpc == null)
                return false;
            
            _context.TagsPerCard.Remove(tpc);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<TagsPerCard>> CreateByTagNamesAndCardIdAsync(string[] tagNames, long cardId)
        {
            List<TagsPerCard> tpcs = [];

            foreach (string tagName in tagNames) {
                tpcs.Add(await CreateByTagNameAndCardIdAsync(tagName, cardId));
            }

            return tpcs;
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

            // NOTE: This is for updating the tags, if the tag already exists then don't add it else there'll be a thrown error
            /*******************************************************/
            TagsPerCard? tpc = await GetByTagNameAndCardIdAsync(tagName, cardId);

            if (tpc != null) return tpc;
            /*******************************************************/

            tpc = new()
            {
                TagsPerCardId = 0,
                TagId = tag.TagId,
                CardId = cardId
            };

            return await CreateAsync(tpc);
        }

        // TODO: Make a function: GetCardTemplatesByOwnerIdAsync(string ownerId)
        // Would query just like GetCardsByOwnerIdAsync(), but also filter for each having .ILike("template") like we do in IsCardTemplateAsync

        public async Task<IEnumerable<Card>> GetCardTemplatesByOwnerIdAsync(string ownerId) {
           List<Card>? cards = (await _cardPerOwnerService.GetCardsByOwnerIdAsync(ownerId)).ToList();

            // https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.todictionary?view=net-9.0
            // https://learn.microsoft.com/en-us/dotnet/api/system.data.entity.queryableextensions.todictionaryasync?view=entity-framework-6.2.0
            IEnumerable<long>? cardTemplateIds = await GetTemplateCardIdsAsync();

            //https://chatgpt.com/share/68752a61-4bb8-800c-bd2e-88b4002c6aa0
            //https://chatgpt.com/share/68752a61-4bb8-800c-bd2e-88b4002c6aa0

            // https://www.nilebits.com/blog/2024/06/multiple-dbcontexts-in-a-single-query/
            return cards.Where(c => cardTemplateIds.Contains(c.CardId));
        }
    }
}