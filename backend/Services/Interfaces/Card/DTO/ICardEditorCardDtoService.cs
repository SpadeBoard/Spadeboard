using Models.Cards;

namespace Services
{
    public interface ICardEditorCardDtoService: ICrudDto<CardEditorCardDto>
    {
        public Task<CardEditorCardDto> CreateDtoForGameRoomFromExistingDtoAsync(CardEditorCardDto dto);

        public Task<CardEditorCardDto> CreateDtoFromExistingDtoAsync(CardEditorCardDto dto);
    }
}