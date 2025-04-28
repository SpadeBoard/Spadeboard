using Models.Bridge;
using Models.Cards;
using Models.DndItems;

namespace Services
{
    public interface IDndItemDtoService: ICrud<DndItemDto>, ICrudNav<DndItemDto>
    {
        public Task<DndItemDto?> GetByDndItemIdAndDndPositionIdAsync(int dndItemId, int dndPositionId);
    }
}