using Models.Cards;

namespace Services
{
    public interface ICardEditorCardDtoService: ICrudDto<CardEditorCardDto>
    {
        public Task CreateDtoForGameRoomFromExistingDtoAsync(CardEditorCardDto dto);
    }
}