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
    public class StyleDtoService(IMapper mapper,IStyleService styleService) : IStyleDtoService
    {
        private readonly IStyleService _styleService = styleService;
        private readonly IMapper _mapper = mapper;

        public async Task<StyleDto> CreateDtoAsync(StyleDto styleDto)
        {
            Style style = _mapper.Map<Style>(styleDto);
            await _styleService.CreateAsync(style);
            return  _mapper.Map<StyleDto>(style);
        }

        public async Task<IEnumerable<StyleDto>> GetAllDtoAsync() {
             return  _mapper.Map<IEnumerable<StyleDto>>(await _styleService.GetAllAsync());
        }
        
        public async Task<StyleDto?> GetDtoAsync(string id)
        {
            if (!Exists(id)) {
                return null;
            }

            Style? style = await _styleService.GetAsync(DtoIdConversion.DtoStringToLong(id));

            if (style == null)
            {
                return null;
            }

            return _mapper.Map<StyleDto>(style);
        }

        public async Task<bool> UpdateDtoAsync(string id, StyleDto styleDto)
        {
            if (!Exists(id)) {
                return false;
            }

            Style style = _mapper.Map<Style>(styleDto);
            bool updated = await _styleService.UpdateAsync(style.StyleId, style);

            return updated;
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            if (!Exists(id)) {
                return false;
            }

            bool deleted = await _styleService.DeleteAsync( DtoIdConversion.DtoStringToLong(id));

            return deleted;
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
            return _styleService.Exists(DtoIdConversion.DtoStringToLong(id));
        }
    }
}
