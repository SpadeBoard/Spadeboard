using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardFacePerCardDtoService : ICrudDto<CardFacePerCardDto>
    {
        public Task<IEnumerable<CardFacePerCardDto>> CreateAllDtoAsyncFromCardEditorCardDto(CardEditorCardDto cardEditorCardDto);

        public Task<IEnumerable<CardFaceDto>> GetAllFacesDtoByCardId(string cardId);

        public Task<bool> DeleteDtoByCardAndCardFaceAsync(string cardId,string cardFaceId);

        public Task<IEnumerable<FileStream>> GetCardFacesByLodDtoAsync(string cardId, int lod);
    }
}