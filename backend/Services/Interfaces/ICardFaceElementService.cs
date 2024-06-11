using Models.Cards;

namespace Services
{
    public interface ICardFaceElementService
    {
        Task<IEnumerable<CardFaceElement>> GetCardFaceElementsByCardFaceId(int cardFaceId);

        // TODO: GetCardFaceElementsDtoAsync
        Task <CardFaceElement?> GetCardFaceElementAsync(int cardFaceElementId);
        
        Task <IEnumerable<CardFaceElement>> GetCardFaceElementsAsync();

        Task<IEnumerable<CardFaceElement>> GetCardFaceElementsDtoAsync();

        Task<CardFaceElement> GetCardFaceElementDtoAsync(int cardFaceElementId);

        Task<IEnumerable<CardFaceElement>> GetCardFaceElementsDtoByCardFaceId(int cardFaceId);

        void SetCardFaceElementsCardFace(CardFaceElement[] cardFaceElements, CardFace cardFace);
        Task SetCardFaceElementsCardFaceAsync(CardFaceElement[] cardFaceElements, CardFace cardFace);
    
        Task DeleteCardFaceElementsDtoAsync(CardFaceElement[] cardFaceElements) ;

        Task DeleteCardFaceElementDtoAsync(CardFaceElement cardFaceElement) ;

        Task UpdateCardFaceElementsDtoAsync(CardFaceElement[] cardFaceElements);

        Task UpdateCardFaceElementDtoAsync(CardFaceElement cardFaceElement);

        // TODO: Refactor this function to be in a universal interface
        bool Exists(int id);
    }
}