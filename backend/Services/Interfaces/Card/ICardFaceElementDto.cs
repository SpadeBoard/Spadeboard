using Models.Cards;

namespace Services
{
    public interface ICardFaceElementDtoService
    {
        public Task<IEnumerable<CardFaceElementDto>> GetAllDtoByCardFaceIdAsync(long cardFaceId);
        
        public Task<CardFaceElementDto?> GetDtoAsync(long id);

        public Task UpdateAllDtoAsync(CardFaceElementDto[] cardFaceElementsDto);

        public Task UpdateDtoAsync(CardFaceElementDto cardFaceElementDto);

        public Task CreateAllDtoAsync(CardFaceElementDto[] cardFaceElementsDto, CardFace cardFace);

        public Task CreateDtoAsync(CardFaceElementDto cardFaceElementDto, CardFace cardFace);
    }
}