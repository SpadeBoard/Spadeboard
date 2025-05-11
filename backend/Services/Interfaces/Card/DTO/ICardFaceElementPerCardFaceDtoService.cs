using Models.Cards;
using Models.Bridge;

namespace Services
{
    public interface ICardFaceElementPerCardFaceDtoService : ICrudDto<CardFaceElementPerCardFaceDto>
    {
        public Task<IEnumerable<CardFaceElementPerCardFaceDto>> CreateAllNavDtoByCardFaceDtoIdAsync(CardFaceElementPerCardFaceDto[] cardFaceElementsPerCardFaceDtos, CardFaceDto cardFaceDto);

        public Task<IEnumerable<CardFaceElementPerCardFaceDto>> CreateAllNavDtoByCardFaceIdFromExistingAllNavDtoAsync(CardFaceElementPerCardFaceDto[] cardFaceElementsPerCardFaceDtos, CardFaceDto cardFaceDto);

        public Task<IEnumerable<CardFaceElementPerCardFaceDto>> GetAllNavDtoByCardFaceDtoIdAsync(string cardFaceId);
    
        public Task<bool> UpdateAllDtoNavByCardFaceAsync(CardFaceElementPerCardFaceDto[] cardFaceElementsPerCardFaceDto, CardFaceDto cardFaceDto);
    }
}