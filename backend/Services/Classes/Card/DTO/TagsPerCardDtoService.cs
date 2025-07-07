using AutoMapper;
using Models.Bridge;
using Utils;
using Models.Cards;

namespace Services
{
    public class TagsPerCardDtoService: ITagsPerCardDtoService
    {
        private readonly ITagsPerCardService _tagsPerCardService;
        private readonly IMapper _mapper;
        private readonly DtoCrudService<TagsPerCard, TagsPerCardDto> _dtoCrudService;

        public TagsPerCardDtoService(IMapper mapper, ITagsPerCardService tagsPerCardService)
        {
            _mapper = mapper;
            _tagsPerCardService = tagsPerCardService;
            _dtoCrudService = new DtoCrudService<TagsPerCard, TagsPerCardDto>(_mapper, _tagsPerCardService);
        }

        public async Task<TagsPerCardDto> CreateDtoAsync(TagsPerCardDto dto)
        {
            return await _dtoCrudService.CreateDtoAsync(dto);
        }

        public async Task<IEnumerable<TagsPerCardDto>> GetAllDtoAsync() {
             return  await _dtoCrudService.GetAllDtoAsync();
        }
        
        public async Task<TagsPerCardDto?> GetDtoAsync(string id)
        {
            return await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, TagsPerCardDto dto)
        {
            return await _dtoCrudService.UpdateDtoAsync(id, dto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }

        public async Task<IEnumerable<String>> GetTagNamesByCardIdDtoAsync(string cardId)
        {
            return await _tagsPerCardService.GetTagNamesByCardIdAsync(DtoIdConversion.DtoStringToLong(cardId));
        }

        public async Task<TagsPerCardDto> CreateByTagNameAndCardIdDtoAsync(string tagName, string cardId) {
            return _mapper.Map<TagsPerCardDto>(await _tagsPerCardService.CreateByTagNameAndCardIdAsync(tagName, DtoIdConversion.DtoStringToLong(cardId)));
        }

         public async Task<IEnumerable<TagsPerCardDto>> CreateByTagNamesAndCardIdDtoAsync(string[] tagNames, string cardId) {
            return _mapper.Map<IEnumerable<TagsPerCardDto>>(await _tagsPerCardService.CreateByTagNamesAndCardIdAsync(tagNames, DtoIdConversion.DtoStringToLong(cardId)));
        }

        public async Task<bool> DeleteByTagNamesAndCardIdDtoAsync(string[] tagNames, string cardId)
        {
            return await _tagsPerCardService.DeleteByTagNamesAndCardIdAsync(tagNames, DtoIdConversion.DtoStringToLong(cardId));
        }

        public async Task<bool> DeleteByTagNameAndCardIdDtoAsync(string tagName, string cardId)
        {
            return await _tagsPerCardService.DeleteByTagNameAndCardIdAsync(tagName, DtoIdConversion.DtoStringToLong(cardId));
        }

        public async Task<bool> IsCardTemplateDtoAsync(string cardId)
        {
            return await _tagsPerCardService.IsCardTemplateAsync(DtoIdConversion.DtoStringToLong(cardId));
        }

        public async Task<IEnumerable<CardDto>> GetCardTemplatesByOwnerIdDtoAsync(string ownerId)
        {
            return _mapper.Map<IEnumerable<CardDto>>(await _tagsPerCardService.GetCardTemplatesByOwnerIdAsync(ownerId));
        }
    }
}