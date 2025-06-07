using AutoMapper;
using Models.Bridge;
using Models.Cards;
using Utils;

namespace Services
{
    public class CardFacePerCardDtoService : ICardFacePerCardDtoService
    {
        private readonly ICardFacePerCardService _cardFacePerCardService;
        private readonly IMapper _mapper;

        private readonly DtoCrudService<CardFacePerCard, CardFacePerCardDto> _dtoCrudService;

         public CardFacePerCardDtoService(IMapper mapper, ICardFacePerCardService cardFacePerCardService)
        {
             _mapper = mapper;
            _cardFacePerCardService = cardFacePerCardService;
            _dtoCrudService = new(_mapper, _cardFacePerCardService);
        }

        public async Task<IEnumerable<CardFacePerCardDto>> CreateAllDtoAsyncFromCardEditorCardDto(CardEditorCardDto cardEditorCardDto)
        {
            if (cardEditorCardDto?.CardEditorCardFacesDto == null)
            {
                throw new ArgumentNullException(nameof(cardEditorCardDto.CardEditorCardFacesDto),
                    "CardEditorCardFacesDto cannot be null.");
            }

            string cardId = cardEditorCardDto.Card.CardId;
            
            var newCfcDtos = new List<CardFacePerCardDto>();

            foreach (CardEditorCardFaceDto cardEditorCardFaceDto in cardEditorCardDto.CardEditorCardFacesDto)
            {
                var cfcDto = new CardFacePerCardDto
                {
                    CardId = cardId,
                    CardFaceId = cardEditorCardFaceDto.CardFace.CardFaceId
                };

                // Persist the entity
                await _cardFacePerCardService.CreateAsync(_mapper.Map<CardFacePerCard>(cfcDto));

                newCfcDtos.Add(cfcDto);
            }

            return newCfcDtos;
        }

        public async Task<IEnumerable<CardFaceDto>> GetAllFacesDtoByCardId(string cardId)
        {
            return _mapper.Map<IEnumerable<CardFaceDto>>(await _cardFacePerCardService.GetAllFacesByCardId(DtoIdConversion.DtoStringToLong(cardId)));
        }

        public async Task<bool> UpdateDtoAsync(string id, CardFacePerCardDto dto)
        {
            return await _dtoCrudService.UpdateDtoAsync(id, dto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
          return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public async Task<bool> DeleteDtoByCardAndCardFaceAsync(string cardId,string cardFaceId)
        {
            return await _cardFacePerCardService.DeleteByCardAndCardFaceAsync(DtoIdConversion.DtoStringToLong(cardId), DtoIdConversion.DtoStringToLong(cardFaceId));
        }

        public bool Exists(string id) 
        {
            return _dtoCrudService.Exists(id);
        }

        public async Task<CardFacePerCardDto?> GetDtoAsync(string id)
        {
            return await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<CardFacePerCardDto> CreateDtoAsync(CardFacePerCardDto cardFacePerCardDto)
        {
            return await _dtoCrudService.CreateDtoAsync(cardFacePerCardDto);
        }

        public async Task<IEnumerable<CardFacePerCardDto>> GetAllDtoAsync()
        {
           return await _dtoCrudService.GetAllDtoAsync();
        }
    }
}