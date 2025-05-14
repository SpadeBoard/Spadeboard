using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Utils;

namespace Services
{
    public class DtoCrudService<TEntity, TDto> where TEntity : class where TDto : class
    {
        private readonly IMapper _mapper;
        private readonly ICrud<TEntity> _service;

        public DtoCrudService(IMapper mapper, ICrud<TEntity> service)
        {
            _mapper = mapper;
            _service = service;
        }

        public async Task<TDto> CreateDtoAsync(TDto dto)
    {
        TEntity entity = _mapper.Map<TEntity>(dto);
        entity = await _service.CreateAsync(entity);
        return _mapper.Map<TDto>(entity);
    }

        public async Task<IEnumerable<TDto>> GetAllDtoAsync()
        {
            var entities = await _service.GetAllAsync();
            return _mapper.Map<IEnumerable<TDto>>(entities);
        }

        public async Task<TDto?> GetDtoAsync(string id)
        {
            if (!Exists(id)) {
                return null;
            }

            var entity = await _service.GetAsync(DtoIdConversion.DtoStringToLong(id));
            if (entity == null) return null;
            return _mapper.Map<TDto>(entity);
        }

        public async Task<bool> UpdateDtoAsync(string id, TDto dto)
        {
            if (!Exists(id)) {
                return false;
            }

            TEntity entity = _mapper.Map<TEntity>(dto);
            return await _service.UpdateAsync(DtoIdConversion.DtoStringToLong(id), entity);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            if (!Exists(id)) {
                return false;
            }
            
            return await _service.DeleteAsync(DtoIdConversion.DtoStringToLong(id));
        }

        public bool Exists(string id)
        {
            return _service.Exists(DtoIdConversion.DtoStringToLong(id));
        }

        public bool IsModified(TDto dto)
        {
            TEntity entity = _mapper.Map<TEntity>(dto);
            return _service.IsModified(entity);
        }
    }
}