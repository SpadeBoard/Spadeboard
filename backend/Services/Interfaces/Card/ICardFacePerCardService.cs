using Models.Bridge;
using Models.Cards;

namespace Services
{
    public interface ICardFacePerCardService: ICrud<CardFacePerCard>, ICrudNav<CardFacePerCard>
    {
        public Task<IEnumerable<CardFacePerCard>> GetAllNavByCardId(long cardId);

        public Task<IEnumerable<CardFacePerCard>> GetAllByCardId(long cardId);
    
        public Task CreateAsyncFromCardEditorCardDto(CardEditorCardDto cardEditorCardDto);
    }
}