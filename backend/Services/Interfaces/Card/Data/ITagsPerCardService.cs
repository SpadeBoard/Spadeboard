using Models.Bridge;

namespace Services
{
    public interface ITagsPerCardService: ICrud<TagsPerCard>
    {
        public Task<IEnumerable<String>> GetTagNamesByCardIdAsync(long cardId);
        public Task<bool> DeleteByTagNameAndCardIdAsync(string tagName, long cardId);

        public Task<TagsPerCard> CreateByTagNameAndCardIdAsync(string tagName, long cardId);
    }
}