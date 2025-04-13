using Models.Cards;

namespace Services
{
    public interface ICardFaceElementService
    {
        public Task<IEnumerable<CardFaceElement>> GetCardFaceElementsByCardFaceIdAsync(int cardFaceId);

        public Task <CardFaceElement?> GetCardFaceElementAsync(int cardFaceElementId);
        
        public Task <IEnumerable<CardFaceElement>> GetCardFaceElementsAsync();

        public Task<IEnumerable<CardFaceElement>> GetCardFaceElementsNavAsync();

        public Task<CardFaceElement> GetCardFaceElementNavAsync(int cardFaceElementId);

        public Task<IEnumerable<CardFaceElementDto>> GetCardFaceElementsDtoByCardFaceIdAsync(int cardFaceId);
        
        public Task<CardFaceElementDto?> GetCardFaceElementDtoAsync(int cardFaceElementId, int cardFaceId);

        public Task<IEnumerable<CardFaceElement>> GetCardFaceElementsNavByCardFaceId(int cardFaceId);

        public Task CreateCardFaceElementsNavCardFaceAsync(CardFaceElement[] cardFaceElements, CardFace cardFace);
    
        public Task DeleteCardFaceElementsNavAsync(CardFaceElement[] cardFaceElements) ;

        public Task DeleteCardFaceElementNavAsync(CardFaceElement cardFaceElement) ;

        public Task UpdateCardFaceElementsNavAsync(CardFaceElement[] cardFaceElements);

        public Task UpdateCardFaceElementNavAsync(CardFaceElement cardFaceElement);

        public Task UpdateCardFaceElementsDtoAsync(CardFaceElementDto[] cardFaceElementsDto);

        public Task UpdateCardFaceElementDtoAsync(CardFaceElementDto cardFaceElementDto);

        public Task CreateCardFaceElementsDtoAsync(CardFaceElementDto[] cardFaceElementsDto, CardFace cardFace);

        public Task CreateCardFaceElementDtoAsync(CardFaceElementDto cardFaceElementDto, CardFace cardFace);

        public Task CreateCardFaceElementNavAsync(CardFaceElement cardFaceElement, CardFace cardFace);

        // TODO: Refactor this function to be in a universal interface
        bool Exists(int id);
    }
}