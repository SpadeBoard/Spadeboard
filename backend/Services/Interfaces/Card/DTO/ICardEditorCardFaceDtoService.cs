using Models.Cards;

namespace Services
{
    public interface ICardEditorCardFaceDtoService: ICrudDto<CardEditorCardFaceDto>
    {
        // public Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardFaceIdAsync(string cardFaceId);

        public Task<CardEditorCardFaceDto?> GetDtoAsyncByCardFace(CardFaceDto cardFaceDto);

        public Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardId(string cardId);

        public Task<bool> UpdateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto);

        public Task<bool> UpdateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto);

        public Task<IEnumerable<CardEditorCardFaceDto>> CreateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto);

        public Task<bool> DeleteDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto);
    }
}