using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ITagsPerCardDtoService : ICrudDto<TagsPerCardDto>
    {
        public Task<IEnumerable<String>> GetTagNamesByCardIdDtoAsync(string cardId);
        public Task<TagsPerCardDto> CreateByTagNameAndCardIdDtoAsync(string tagName, string cardId);
        public Task<IEnumerable<TagsPerCardDto>> CreateByTagNamesAndCardIdDtoAsync(string[] tagNames, string cardId);
        public Task<bool> DeleteByTagNameAndCardIdDtoAsync(string tagName, string cardId);
        public Task<bool> DeleteByTagNamesAndCardIdDtoAsync(string[] tagNames, string cardId);

        public Task<bool> IsCardTemplateDtoAsync(string cardId);
        public Task<IEnumerable<CardDto>> GetCardTemplatesByOwnerIdDtoAsync(string ownerId);
    }
}