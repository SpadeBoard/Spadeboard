using AutoMapper;
using Models.Tags;

namespace Services
{
    public class TagDtoService: ITagDtoService
    {
        private readonly IMapper _mapper;
        private readonly ITagService _tagService;
        private readonly DtoCrudService<Tag, TagDto> _dtoCrudService;

        public TagDtoService(IMapper mapper, ITagService tagService)
        {
            _mapper = mapper;
            _tagService = tagService;
            _dtoCrudService = new DtoCrudService<Tag, TagDto>(_mapper, _tagService);
        }

        public async Task<TagDto> CreateDtoAsync(TagDto tagDto)
        {
            return await _dtoCrudService.CreateDtoAsync(tagDto);
        }

        public async Task<IEnumerable<TagDto>> GetAllDtoAsync() {
             return  await _dtoCrudService.GetAllDtoAsync();
        }
        
        public async Task<TagDto?> GetDtoAsync(string id)
        {
            return await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, TagDto tagDto)
        {
            return await _dtoCrudService.UpdateDtoAsync(id, tagDto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }

         public async Task<IEnumerable<String>> GetTagNamesDtoAsync()
         {
            return await _tagService.GetTagNamesAsync();
        }

         public async Task<TagDto?> GetTagByTagNameDtoAsync(string tagName)
         {
            return _mapper.Map<TagDto?>(await _tagService.GetTagByTagNameAsync(tagName));
        }
    }
}