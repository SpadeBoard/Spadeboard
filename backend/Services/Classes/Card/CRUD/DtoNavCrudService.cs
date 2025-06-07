using AutoMapper;
using Utils;

namespace Services
{
    public class DtoNavCrudService<TEntity, TDto> where TEntity : class where TDto : class
    {
        private readonly IMapper _mapper;
        private readonly ICrudNav<TEntity> _service;

        public DtoNavCrudService(IMapper mapper, ICrudNav<TEntity> service)
        {
            _mapper = mapper;
            _service = service;
        }

        public async Task<TDto> CreateDtoNavAsync(TDto dto)
    {
        TEntity entity = _mapper.Map<TEntity>(dto);
        entity = await _service.CreateNavAsync(entity);
        return _mapper.Map<TDto>(entity);
    }

        public async Task<IEnumerable<TDto>> GetAllDtoNavAsync()
        {
            var entities = await _service.GetAllNavAsync();
            return _mapper.Map<IEnumerable<TDto>>(entities);
        }

        public async Task<TDto?> GetDtoNavAsync(string id)
        {
            var entity = await _service.GetNavAsync(DtoIdConversion.DtoStringToLong(id));
            if (entity == null) return null;
            return _mapper.Map<TDto>(entity);
        }

        public async Task<bool> UpdateDtoNavAsync(string id, TDto dto)
        {
            TEntity entity = _mapper.Map<TEntity>(dto);
            return await _service.UpdateNavAsync(entity);
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            return await _service.DeleteNavAsync(DtoIdConversion.DtoStringToLong(id));
        }
    }
}