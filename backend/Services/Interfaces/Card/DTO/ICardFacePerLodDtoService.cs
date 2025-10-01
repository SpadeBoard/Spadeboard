using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardFacePerLodDtoService: ICrudDto<CardFacePerLodDto>
    {
        public Task<bool> AttachLodsByCardFaceIdDtoAsync(string cardFaceId);

        public Task<bool> OrphanLodsByCardFaceIdDtoAsync(string cardFaceId);

        public Task<IEnumerable<CardFacePerLodDto>> CreateAllDtoAsync(CardFacePerLodDto[] items, CardFaceDto cardFace);
    }
}