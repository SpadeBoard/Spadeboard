using Models.Cards;
using Newtonsoft.Json;

// TODO: For the backend, instead of creating the file metadata, we just want to add the keys to the CardFacePerLod table
// And update the file metadata to be attached
namespace Services
{
    public class CardEditorCardFaceDtoService(ICardFacePerCardDtoService cardFacePerCardDtoService, ICardFaceDtoService cardFaceDtoService, ICardFaceElementPerCardFaceDtoService cardFaceElementPerCardFaceDtoService, ICardFacePerLodDtoService cardFacePerLodDtoService) : ICardEditorCardFaceDtoService
    {
        private readonly ICardFacePerCardDtoService _cardFacePerCardDtoService = cardFacePerCardDtoService;
        private readonly ICardFaceDtoService _cardFaceDtoService = cardFaceDtoService;
        private readonly ICardFaceElementPerCardFaceDtoService _cardFaceElementPerCardFaceDtoService = cardFaceElementPerCardFaceDtoService;
        private readonly ICardFacePerLodDtoService _cardFacePerLodDtoService = cardFacePerLodDtoService;

        public async Task<IEnumerable<CardEditorCardFaceDto>> CreateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto)
        {
            var results = new List<CardEditorCardFaceDto>();
            foreach (CardEditorCardFaceDto cardEditorCardFaceDto in cardEditorCardFacesDto)
            {
                CardEditorCardFaceDto result = await CreateDtoAsync(cardEditorCardFaceDto);
                results.Add(result);

                await _cardFacePerLodDtoService.AttachLodsByCardFaceIdDtoAsync(result.CardFace.CardFaceId);
            }
            return results;
        }
        public async Task<CardEditorCardFaceDto> CreateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            try
            {
                CardFaceDto cardFace = await _cardFaceDtoService.CreateDtoNavAsync(cardEditorCardFaceDto.CardFace);

                if (cardFace.CardFaceId == "0") throw new Exception("Card face ID is not updated");

                Console.WriteLine($"\nCard Editor Card Face Dto - After Card Face Create DTO Nav Async: {JsonConvert.SerializeObject(cardFace, Formatting.Indented)}\n");

                await _cardFacePerLodDtoService.CreateAllFromFilesMetadataPerCardFaceDtoAsync(cardEditorCardFaceDto.FileMetadataLods, cardFace.CardFaceId);
                await _cardFacePerLodDtoService.AttachLodsByCardFaceIdDtoAsync(cardFace.CardFaceId);

                return new CardEditorCardFaceDto
                {
                    CardFace = cardFace,
                    CardFaceElementsPerCardFace = (await _cardFaceElementPerCardFaceDtoService
        .CreateAllNavDtoByCardFaceDtoIdAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardFace))
        .ToArray(),
                    FileMetadataLods = (await _cardFacePerLodDtoService.GetFilesMetadataByCardFaceDto(cardFace.CardFaceId)).ToArray()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception: {0}", ex.Message);
                throw;
            }
        }

        public async Task<CardEditorCardFaceDto?> GetDtoAsyncByCardFace(CardFaceDto cardFaceDto)
        {
            return new()
            {
                CardFace = cardFaceDto,
                CardFaceElementsPerCardFace = (await _cardFaceElementPerCardFaceDtoService.GetAllNavDtoByCardFaceDtoIdAsync(cardFaceDto.CardFaceId)).ToArray(),
                FileMetadataLods = (await _cardFacePerLodDtoService.GetFilesMetadataByCardFaceDto(cardFaceDto.CardFaceId)).ToArray()
            };
        }

        public async Task<bool> UpdateAllDtoAsync(CardEditorCardFaceDto[] cardEditorCardFacesDto)
        {
            var updated = true;

            foreach (var cfd in cardEditorCardFacesDto)
            {
                updated = await UpdateDtoAsync(cfd);

                if (updated == false)
                    return updated;
            }

            return updated;
        }

        public async Task<bool> UpdateDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            // CHECKME: Do we need to check to see if the CardFacePerLod's File Metadata ID already exists
            // TODO: Update the CardFacePerLod by swapping out the ID of the previous file metadata with the new one based on the CardFacePerLod Id
            return await _cardFaceElementPerCardFaceDtoService.UpdateAllDtoNavByCardFaceAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardEditorCardFaceDto.CardFace);
        }

        public async Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoByCardId(string cardId)
        {
            // NOTE: Returns the navigational properties
            IEnumerable<CardFaceDto>? cfpc = await _cardFacePerCardDtoService.GetAllFacesDtoByCardId(cardId);

            var results = new List<CardEditorCardFaceDto>();

            foreach (var cardFace in cfpc)
            {
                var dto = await GetDtoAsyncByCardFace(cardFace);
                if (dto != null)
                {
                    results.Add(dto);
                }
            }

            return results;
        }

        public async Task<IEnumerable<CardEditorCardFaceDto>> GetAllDtoAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoAsync(string id, CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            // TODO: Grab the card face, grab the card face elements, then delete them
            // TODO: Call _cardFaceElementPerCardFace.DeleteAllNavByCardFaceAsync
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoAsync(CardEditorCardFaceDto cardEditorCardFaceDto)
        {
            // TODO: Use  await _cardFacePerLodDtoService.AttachLodsByCardFaceIdDtoAsync(result.CardFace.CardFaceId);

            return await _cardFaceElementPerCardFaceDtoService.DeleteAllDtoNavByCardFaceAsync(cardEditorCardFaceDto.CardFaceElementsPerCardFace, cardEditorCardFaceDto.CardFace);
        }

        public async Task<CardEditorCardFaceDto?> GetDtoAsync(string id)
        {
            throw new NotImplementedException();
        }

        public bool Exists(string id)
        {
            throw new NotImplementedException();
        }
    }
}