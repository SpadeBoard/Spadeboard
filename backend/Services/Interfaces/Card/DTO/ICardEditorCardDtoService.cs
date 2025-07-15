using Models.Cards;

namespace Services
{
    public interface ICardEditorCardDtoService: ICrudDto<CardEditorCardDto>
    {
        public Task<string[]> CreateAndResolveTagNamesAsync(string[] tagNames, string cardId);
    }
}