using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Models.DndItems;
using Utils;
using Models.Styles;

namespace Services
{
    public class StyleDtoService: IStyleDtoService
    {
        private readonly IStyleService _styleService;
        private readonly IMapper _mapper;

        private readonly DtoCrudService<Style, StyleDto> _dtoCrudService;

        public StyleDtoService(IMapper mapper,IStyleService styleService) 
        {
            _styleService = styleService;
            _mapper = mapper;
             _dtoCrudService = new(_mapper, _styleService);
        }

        public async Task<StyleDto> CreateDtoAsync(StyleDto styleDto)
        {
            return await _dtoCrudService.CreateDtoAsync(styleDto);
        }

        public async Task<IEnumerable<StyleDto>> GetAllDtoAsync() {
            return  await _dtoCrudService.GetAllDtoAsync();
        }
        
        public async Task<StyleDto?> GetDtoAsync(string id)
        {
            return  await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, StyleDto styleDto)
        {
             return await _dtoCrudService.UpdateDtoAsync(id, styleDto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public async Task<StyleDto> CreateDtoNavAsync(StyleDto styleDto)
        {
            throw new NotImplementedException();
        }
        
        public async Task<StyleDto?> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, StyleDto styleDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
           throw new NotImplementedException();
        }


        public bool Exists(string id)
        {
           return _dtoCrudService.Exists(id);
        }
    }
}
