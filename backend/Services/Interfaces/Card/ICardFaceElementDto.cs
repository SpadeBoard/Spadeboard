using Models.Cards;

namespace Services
{
    public interface ICardFaceElementDtoService
    {
        public Task<IEnumerable<CardFaceElementDto>> GetAllDtoByCardFaceIdAsync(int cardFaceId);
        
        public Task<CardFaceElementDto?> GetDtoAsync(int id);

        public Task UpdateAllDtoAsync(CardFaceElementDto[] cardFaceElementsDto);

        public Task UpdateDtoAsync(CardFaceElementDto cardFaceElementDto);

        public Task CreateAllDtoAsync(CardFaceElementDto[] cardFaceElementsDto, CardFace cardFace);

        public Task CreateDtoAsync(CardFaceElementDto cardFaceElementDto, CardFace cardFace);
    }
}