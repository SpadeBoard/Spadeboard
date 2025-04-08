using Models.Cards;

namespace Services
{
    // TODO: Rename the DTO functions to nav
    public interface ICardFaceElementService
    {
        Task<IEnumerable<CardFaceElement>> GetCardFaceElementsByCardFaceIdAsync(int cardFaceId);

        Task <CardFaceElement?> GetCardFaceElementAsync(int cardFaceElementId);
        
        Task <IEnumerable<CardFaceElement>> GetCardFaceElementsAsync();

        Task<IEnumerable<CardFaceElement>> GetCardFaceElementsNavAsync();

        Task<CardFaceElement> GetCardFaceElementNavAsync(int cardFaceElementId);

        Task<IEnumerable<CardFaceElementDto>> GetCardFaceElementsDtoByCardFaceIdAsync(int cardFaceId);
        
        Task<CardFaceElementDto?> GetCardFaceElementDtoAsync(int cardFaceElementId, int cardFaceId);

        Task<IEnumerable<CardFaceElement>> GetCardFaceElementsNavByCardFaceId(int cardFaceId);

        Task CreateCardFaceElementsNavCardFaceAsync(CardFaceElement[] cardFaceElements, CardFace cardFace);
    
        Task DeleteCardFaceElementsNavAsync(CardFaceElement[] cardFaceElements) ;

        Task DeleteCardFaceElementNavAsync(CardFaceElement cardFaceElement) ;

        Task UpdateCardFaceElementsNavAsync(CardFaceElement[] cardFaceElements);

        Task UpdateCardFaceElementNavAsync(CardFaceElement cardFaceElement);

        Task UpdateCardFaceElementsDtoAsync(CardFaceElementDto[] cardFaceElementsDto);

        Task UpdateCardFaceElementDtoAsync(CardFaceElementDto cardFaceElementDto);

        Task CreateCardFaceElementsDtoAsync(CardFaceElementDto[] cardFaceElementsDto, CardFace cardFace);

        Task CreateCardFaceElementDtoAsync(CardFaceElementDto cardFaceElementDto, CardFace cardFace);

        Task CreateCardFaceElementNavAsync(CardFaceElement cardFaceElement, CardFace cardFace);

        // TODO: Refactor this function to be in a universal interface
        bool Exists(int id);
    }
}