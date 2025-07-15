using Models.Tags;

namespace Services
{
    public interface ITagService: ICrud<Tag>
    {
        public Task<IEnumerable<String>> GetTagNamesAsync();

        public Task<Tag?> GetTagByTagNameAsync(string tagName);
    }
}