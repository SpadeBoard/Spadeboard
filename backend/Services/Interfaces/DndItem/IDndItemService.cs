using Models.Bridge;
using Models.Cards;
using Models.DndItems;

namespace Services
{
    public interface IDndItemService: ICrud<DndItem>
    {
        // public Task<CardFaceElementPerCardFace?> GetAllNavByCardFaceElementIdAndCardFaceIdAsync(long cardFaceElementId, long cardFaceId);
    }
}