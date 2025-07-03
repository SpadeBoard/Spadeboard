using Models.Bridge;

namespace Services
{
    public interface ITagsPerCardDtoService : ICrudDto<TagsPerCardDto>
    {
        public Task<IEnumerable<String>> GetTagNamesByCardIdDtoAsync(string cardId);

        public Task<bool> DeleteByTagNameAndCardIdDtoAsync(string tagName, string cardId);
    }
}