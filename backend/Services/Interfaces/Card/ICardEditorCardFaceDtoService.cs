using Models.Cards;

namespace Services
{
    public interface ICardEditorCardFaceDtoService
    {
        public Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardFaceIdAsync(int cardFaceId);
        
        public Task<CardEditorCardFaceDto?> GetDtoAsync(int id);

        public Task<CardEditorCardFaceDto?> GetDtoAsyncByCardFaceIdAsync(int id);

        public Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardId(int cardId);

        public Task UpdateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto);

        public Task UpdateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto);

        public Task CreateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto);

        public Task CreateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto);
    }
}