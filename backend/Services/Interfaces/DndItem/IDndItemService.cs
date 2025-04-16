using Models.Bridge;
using Models.Cards;
using Models.DndItems;

namespace Services
{
    public interface IDndItemService
    {
        public Task<CardFaceElementPerCardFace?> GetCardFaceElementPerCardFaceByCardFaceIdAsync(int cardFaceElementId, int cardFaceId);

        public Task CreateCardFaceElementPerCardFaceAsync(CardFaceElementDto cardFaceElementDto);

        public Task CreateDndItemNavAsync(DndItem dndItem);

        public Task CreateDndPositionAsync(DndPosition dndPosition);
    
        public bool Exists(int id);

        public Task<DndItemDto?> GetDndItemDtoByDndItemIdAndDndPositionIdAsync(int dndItemId, int dndPositionId);
    }
}