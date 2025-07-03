using AutoMapper;
using Models.Bridge;
using Utils;

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

        public async Task<bool> DeleteByTagNameAndCardIdDtoAsync(string tagName, string cardId)
        {
            return await  _tagsPerCardService.DeleteByTagNameAndCardIdAsync(tagName, DtoIdConversion.DtoStringToLong(cardId));
        }
    }
}