using Models.Tags;

namespace Services
{
    public interface ITagDtoService: ICrudDto<TagDto>
    {
        public Task<IEnumerable<String>> GetTagNamesDtoAsync();

        public Task<TagDto?> GetTagByTagNameDtoAsync(string tagName);
    }
}