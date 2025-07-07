using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ITagsPerCardService: ICrud<TagsPerCard>
    {
        public Task<IEnumerable<String>> GetTagNamesByCardIdAsync(long cardId);
        public Task<TagsPerCard?> GetByTagNameAndCardIdAsync(string tagName, long cardId);
        public Task<bool> DeleteByTagNameAndCardIdAsync(string tagName, long cardId);
        public Task<bool> DeleteByTagNamesAndCardIdAsync(string[] tagNames, long cardId);

        public Task<TagsPerCard> CreateByTagNameAndCardIdAsync(string tagName, long cardId);
        public Task<IEnumerable<TagsPerCard>> CreateByTagNamesAndCardIdAsync(string[] tagNames, long cardId);

        public Task<bool> IsCardTemplateAsync(long cardId);
        public Task<IEnumerable<Card>> GetCardTemplatesByOwnerIdAsync(string ownerId);
    }
}