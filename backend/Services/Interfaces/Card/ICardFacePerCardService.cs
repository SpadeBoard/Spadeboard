using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardFacePerCardService: ICrud<CardFacePerCard>, ICrudNav<CardFacePerCard>
    {
        public Task<IEnumerable<CardFacePerCard>> GetAllNavByCardId(int cardId);

        public Task<IEnumerable<CardFacePerCard>> GetAllByCardId(int cardId);
    
        public Task CreateAsyncFromCardEditorCardDto(CardEditorCardDto cardEditorCardDto);
    }
}