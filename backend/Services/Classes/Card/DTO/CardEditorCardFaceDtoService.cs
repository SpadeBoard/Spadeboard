using Models.Cards;
using Models.Files;
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
            string cardFaceId = cardEditorCardFaceDto.CardFace.CardFaceId;
            FileMetadataDto[] fileMetadataLods = cardEditorCardFaceDto.FileMetadataLods;

            // NOTE: Essentially we need to check whether the LODs already exist and whether there's LODs to add because someone might have not flipped the back face and only modified the front face
            // Which means that we need the second condition otherwise we'll send in an empty array leading to that exception
            if ((await _cardFacePerLodDtoService.GetFilesMetadataByCardFaceDto(cardFaceId)).ToList().Count <= 0 && fileMetadataLods.Length > 0)
            {
                if ((await _cardFacePerLodDtoService.CreateAllFromFilesMetadataPerCardFaceDtoAsync(fileMetadataLods, cardFaceId)).ToList().Count <= 0) throw new Exception("If the card face didn't have LODs before, it should've created them now");
                if (fileMetadataLods.Any((FileMetadataDto fm) => fm.FileMetadataStatus != FileMetadataStatus.Attached)) await _cardFacePerLodDtoService.AttachLodsByCardFaceIdDtoAsync(cardFaceId);  // NOTE: Frontend sets the LODs as pending
            }
            else
            {
                await _cardFacePerLodDtoService.UpdateFileMetadataByCardFaceDto(cardEditorCardFaceDto.CardFace.CardFaceId, cardEditorCardFaceDto.FileMetadataLods.Select(f => f.FileMetadataId).ToList());
                if (fileMetadataLods.Any((FileMetadataDto fm) => fm.FileMetadataStatus != FileMetadataStatus.Attached)) await _cardFacePerLodDtoService.AttachLodsByCardFaceIdDtoAsync(cardFaceId); // NOTE: Frontend sets the LODs as pending
            }

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
            await _cardFacePerLodDtoService.DeleteByCardFaceDtoAsync(cardEditorCardFaceDto.CardFace.CardFaceId);

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