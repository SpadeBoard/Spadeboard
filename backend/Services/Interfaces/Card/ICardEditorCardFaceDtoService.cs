using Models.Cards;

namespace Services
{
    public interface ICardEditorCardFaceDtoService
    {
        public Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardFaceIdAsync(long cardFaceId);
        
        public Task<CardEditorCardFaceDto?> GetDtoAsync(long id);

        public Task<CardEditorCardFaceDto?> GetDtoAsyncByCardFaceIdAsync(long id);

        public Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardId(long cardId);

        public Task<bool> UpdateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto);

        public Task<bool> UpdateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto);

        public Task CreateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto);

        public Task CreateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto);

        public Task CreateAllDtoFromExistingAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto);
    
        public Task CreateDtoForGameRoomFromExistingDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto);
    }
}