using Models.Bridge;
using Models.Cards;
using Models.DndItems;

namespace Services
{
    public interface IDndItemService: ICrud<DndItem>
    {
        public Task<CardFaceElementPerCardFace?> GetCardFaceElementPerCardFaceByCardFaceIdAsync(int cardFaceElementId, int cardFaceId);

        public Task CreateCardFaceElementPerCardFaceAsync(CardFaceElementDto cardFaceElementDto);

        public Task CreateDndItemNavAsync(DndItem dndItem);

        public Task CreateDndPositionAsync(DndPosition dndPosition);
    

        public Task<DndItemDto?> GetDndItemDtoByDndItemIdAndDndPositionIdAsync(int dndItemId, int dndPositionId);
    }
}