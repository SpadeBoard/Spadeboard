using Models.DndItems;
using AutoMapper;


namespace Services
{
    public class DndItemDtoService : IDndItemDtoService
    {
        private readonly IMapper _mapper;
        private readonly IDndItemService _dndItemService;
         private readonly DtoCrudService<DndItem, DndItemDto> _dtoCrudService;

        public DndItemDtoService(IMapper mapper, IDndItemService dndItemService)
        {
             _mapper = mapper;
            _dndItemService = dndItemService;
            _dtoCrudService = new(_mapper, _dndItemService);
        }
    
        public async Task<DndItemDto> CreateDtoAsync(DndItemDto dndItemDto)
        {
            return await _dtoCrudService.CreateDtoAsync(dndItemDto);
        }
        
        public async Task<DndItemDto?> GetDtoAsync(string id)
        {
            return  await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, DndItemDto dndItemDto)
        {
            return await _dtoCrudService.UpdateDtoAsync(id, dndItemDto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public async Task<IEnumerable<DndItemDto>> GetAllDtoAsync() 
        {
           return  await _dtoCrudService.GetAllDtoAsync();
        }

         public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }
    }
}