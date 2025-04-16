using Models.Cards;

namespace Services
{
    public interface ICardFaceElementService : ICrud<CardFaceElement>
    {
        public Task<IEnumerable<CardFaceElement>> GetAllByCardFaceIdAsync(int cardFaceId);



        public Task<IEnumerable<CardFaceElement>> GetAllNavAsync();

        public Task<CardFaceElement?> GetNavAsync(int id);

        public Task<IEnumerable<CardFaceElementDto>> GetAllDtoByCardFaceIdAsync(int cardFaceId);
        
        public Task<CardFaceElementDto?> GetDtoAsync(int cardFaceElementId, int cardFaceId);

        public Task<IEnumerable<CardFaceElement>> GetAllNavByCardFaceId(int cardFaceId);

        public Task CreateAllNavCardFaceAsync(CardFaceElement[] cardFaceElements, CardFace cardFace);
    
        public Task DeleteAllNavAsync(CardFaceElement[] cardFaceElements) ;

        public Task<bool> DeleteNavAsync(CardFaceElement cardFaceElement) ;

        public Task UpdateAllNavAsync(CardFaceElement[] cardFaceElements);

        public Task UpdateNavAsync(CardFaceElement cardFaceElement);

        public Task UpdateAllDtoAsync(CardFaceElementDto[] cardFaceElementsDto);

        public Task UpdateDtoAsync(CardFaceElementDto cardFaceElementDto);

        public Task CreateAllDtoAsync(CardFaceElementDto[] cardFaceElementsDto, CardFace cardFace);

        public Task CreateDtoAsync(CardFaceElementDto cardFaceElementDto);

        public Task CreateNavAsync(CardFaceElement cardFaceElement);
    }
}