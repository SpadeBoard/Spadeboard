using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Models.DndItems;
using Utils;

namespace Services
{
    public class CardFacePerCardDtoService(IMapper mapper, ICardFacePerCardService cardFacePerCardService) : ICardFacePerCardDtoService
    {
        private readonly ICardFacePerCardService _cardFacePerCardService =cardFacePerCardService;
        private readonly IMapper _mapper = mapper;

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

        public async Task<bool> UpdateDtoAsync(string id, CardFacePerCardDto cardPerOwnerDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
           if (! Exists(id)) {
                return false;
            }

            bool deleted = await  _cardFacePerCardService.DeleteAsync(DtoIdConversion.DtoStringToLong(id));

            return deleted;
        }

        public async Task<bool> DeleteDtoByCardAndCardFaceAsync(string cardId,string cardFaceId)
        {
            return await _cardFacePerCardService.DeleteByCardAndCardFaceAsync(DtoIdConversion.DtoStringToLong(cardId), DtoIdConversion.DtoStringToLong(cardFaceId));
        }

        public bool Exists(string id) {
            return _cardFacePerCardService.Exists(DtoIdConversion.DtoStringToLong(id));
        }

        public async Task<CardFacePerCardDto> GetDtoAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<CardFacePerCardDto> CreateDtoAsync(CardFacePerCardDto cardFacePerCardDto)
        {
            CardFacePerCard cardFacePerCard = _mapper.Map<CardFacePerCard>(cardFacePerCardDto);
            cardFacePerCard = await _cardFacePerCardService.CreateAsync(cardFacePerCard);
            return  _mapper.Map<CardFacePerCardDto>(cardFacePerCard);
        }

        public async Task<IEnumerable<CardFacePerCardDto>> GetAllDtoAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<CardFacePerCardDto> CreateDtoNavAsync(CardFacePerCardDto cardPerOwnerDto)
        {
            throw new NotImplementedException();
        }
        
        // TODO: Think about where you should implement this
        public async Task<CardFacePerCardDto?> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardFacePerCardDto cardPerOwnerDto)
        {
           throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }
    }
}