using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Models.DndItems;
using Utils;

namespace Services
{
    public class CardFaceElementPerCardFaceDtoService: ICardFaceElementPerCardFaceDtoService
    {
        private readonly ICardFaceElementPerCardFaceService  _cardFaceElementPerCardFaceService;
        private readonly IMapper _mapper;
        private readonly DtoCrudService<CardFaceElementPerCardFace, CardFaceElementPerCardFaceDto> _dtoCrudService;
        private readonly DtoNavCrudService<CardFaceElementPerCardFace, CardFaceElementPerCardFaceDto> _dtoNavCrudService;
        public CardFaceElementPerCardFaceDtoService(IMapper mapper, ICardFaceElementPerCardFaceService  cardFaceElementPerCardFaceService) 
        {
            _mapper = mapper;
            _cardFaceElementPerCardFaceService = cardFaceElementPerCardFaceService;
            _dtoCrudService = new(_mapper, _cardFaceElementPerCardFaceService);
            _dtoNavCrudService = new(_mapper, _cardFaceElementPerCardFaceService);
        }
        public async Task<CardFaceElementPerCardFaceDto> CreateDtoAsync(CardFaceElementPerCardFaceDto cardFaceElementPerCardFaceDto)
        {
            return await _dtoCrudService.CreateDtoAsync(cardFaceElementPerCardFaceDto);
        }

        public async Task<IEnumerable<CardFaceElementPerCardFaceDto>> GetAllDtoAsync()
        {
           return await _dtoCrudService.GetAllDtoAsync();
        }
        
        public async Task<CardFaceElementPerCardFaceDto?> GetDtoAsync(string id)
        {
           return await _dtoCrudService.GetDtoAsync(id);
        }

        public async Task<bool> UpdateDtoAsync(string id, CardFaceElementPerCardFaceDto cardFaceElementPerCardFaceDto)
        {
            return await _dtoCrudService.UpdateDtoAsync(id, cardFaceElementPerCardFaceDto);
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
           return await _dtoCrudService.DeleteDtoAsync(id);
        }

        public async Task<CardFaceElementPerCardFaceDto> CreateDtoNavAsync(CardFaceElementPerCardFaceDto cardFaceElementPerCardFaceDto)
        {
            return await _dtoNavCrudService.CreateDtoNavAsync(cardFaceElementPerCardFaceDto);
        }

        public async Task<IEnumerable<CardFaceElementPerCardFaceDto>> GetAllDtoNavAsync()
        {
           return await _dtoNavCrudService.GetAllDtoNavAsync();
        }
        
        public async Task<CardFaceElementPerCardFaceDto?> GetDtoNavAsync(string id)
        {
            return await _dtoNavCrudService.GetDtoNavAsync(id);
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardFaceElementPerCardFaceDto cardFaceElementPerCardFaceDto)
        {
            return await _dtoNavCrudService.UpdateDtoNavAsync(id, cardFaceElementPerCardFaceDto);
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            return await _dtoNavCrudService.DeleteDtoNavAsync(id);
        }

         public async Task <bool> DeleteAllDtoNavByCardFaceAsync(CardFaceElementPerCardFaceDto[] cardFaceElementsPerCardFaceDto, CardFaceDto cardFaceDto)
         {
            CardFaceElementPerCardFace[] cardFaceElemensPerCardFace = _mapper.Map<CardFaceElementPerCardFace[]>(cardFaceElementsPerCardFaceDto);
            CardFace cardFace = _mapper.Map<CardFace>(cardFaceDto);
            
            return await _cardFaceElementPerCardFaceService.DeleteAllNavByCardFaceAsync(cardFaceElemensPerCardFace, cardFace);
         }

        // TODO: Return cardFaceDto too
        public async Task<IEnumerable<CardFaceElementPerCardFaceDto>> CreateAllNavDtoByCardFaceDtoIdAsync(CardFaceElementPerCardFaceDto[] cardFaceElementsPerCardFaceDtos, CardFaceDto cardFaceDto)
        {
            try
            {
                // CHECKME: Need to make sure it's actually getting the correct type
                foreach (var dto in cardFaceElementsPerCardFaceDtos)
                {
                    if (dto.CardFaceElement == null)
                        throw new ArgumentNullException(nameof(dto.CardFaceElement), "CardFaceElement is null!");

                    Console.WriteLine($"CardFaceElementPerCardFaceId: {dto.CardFaceElementPerCardFaceId}, Type: {dto.CardFaceElement.GetType().Name}");
                
                    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(dto.CardFaceElement));
                }

                CardFaceElementPerCardFace[] cardFaceElementsPerCardFace = _mapper.Map<CardFaceElementPerCardFace[]>(cardFaceElementsPerCardFaceDtos);
                CardFace cardFace = _mapper.Map<CardFace>(cardFaceDto);

                await _cardFaceElementPerCardFaceService.CreateAllNavByCardFaceIdAsync(cardFaceElementsPerCardFace, cardFace);

                return _mapper.Map<IEnumerable<CardFaceElementPerCardFaceDto>>(cardFaceElementsPerCardFace);
            }
            catch (AutoMapperMappingException ex)
            {
                // Log detailed AutoMapper mapping error
                Console.WriteLine("AutoMapper mapping error: " + ex.Message);
                if (ex.InnerException != null)
                    Console.WriteLine("Inner exception: " + ex.InnerException.Message);
                throw; 
            }
            catch (Exception ex)
            {
                Console.WriteLine("Unexpected error: " + ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<CardFaceElementPerCardFaceDto>> CreateAllNavDtoByCardFaceIdFromExistingAllNavDtoAsync(CardFaceElementPerCardFaceDto[] cardFaceElementsPerCardFaceDtos, CardFaceDto cardFaceDto) 
        {
            // CHECKME: Need to make sure it's actually getting the correct type
            foreach (var dto in cardFaceElementsPerCardFaceDtos)
            {
                if (dto.CardFaceElement == null)
                    throw new ArgumentNullException(nameof(dto.CardFaceElement), "CardFaceElement is null!");

                Console.WriteLine($"CardFaceElementPerCardFaceId: {dto.CardFaceElementPerCardFaceId}, Type: {dto.CardFaceElement.GetType().Name}");
            }

            CardFaceElementPerCardFace[] cardFaceElementsPerCardFace = _mapper.Map<CardFaceElementPerCardFace[]>(cardFaceElementsPerCardFaceDtos);
            CardFace cardFace = _mapper.Map<CardFace>(cardFaceDto);

            await _cardFaceElementPerCardFaceService.CreateAllNavByCardFaceIdFromExistingAllNavAsync(cardFaceElementsPerCardFace, cardFace);
            return _mapper.Map<IEnumerable<CardFaceElementPerCardFaceDto>>(cardFaceElementsPerCardFace);
        }

        public async Task<IEnumerable<CardFaceElementPerCardFaceDto>> GetAllNavDtoByCardFaceDtoIdAsync(string cardFaceId)
        {
            IEnumerable<CardFaceElementPerCardFace>? cardFaceElementsPerCardFace = await _cardFaceElementPerCardFaceService.GetAllNavByCardFaceIdAsync(DtoIdConversion.DtoStringToLong(cardFaceId));
            return _mapper.Map<IEnumerable<CardFaceElementPerCardFaceDto>>(cardFaceElementsPerCardFace);
        }

         public bool Exists(string id)
        {
            return _dtoCrudService.Exists(id);
        }

        public async Task<bool> UpdateAllDtoNavByCardFaceAsync(CardFaceElementPerCardFaceDto[] cardFaceElementsPerCardFaceDto, CardFaceDto cardFaceDto)
        {
            CardFaceElementPerCardFace[] cardFaceElementsPerCardFace = _mapper.Map<CardFaceElementPerCardFace[]>(cardFaceElementsPerCardFaceDto);
            CardFace cardFace = _mapper.Map<CardFace>(cardFaceDto);
            return await _cardFaceElementPerCardFaceService.UpdateAllNavByCardFaceAsync(cardFaceElementsPerCardFace, cardFace);
        }
    }
}