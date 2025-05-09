using AutoMapper;
using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Models.DndItems;
using Utils;

namespace Services
{
    public class  CardFaceElementPerCardFaceDtoService(IMapper mapper, ICardFaceElementPerCardFaceService  cardFaceElementPerCardFaceService) : ICardFaceElementPerCardFaceDtoService
    {
        private readonly ICardFaceElementPerCardFaceService  _cardFaceElementPerCardFaceService =  cardFaceElementPerCardFaceService;
        private readonly IMapper _mapper = mapper;

        public async Task<CardFaceElementPerCardFaceDto> CreateDtoAsync(CardFaceElementPerCardFaceDto cardFaceElementPerCardFaceDto)
        {
            CardFaceElementPerCardFace cardFaceElementPerCardFace = _mapper.Map<CardFaceElementPerCardFace>(cardFaceElementPerCardFaceDto);
            await  _cardFaceElementPerCardFaceService.CreateAsync(cardFaceElementPerCardFace);
            return  _mapper.Map<CardFaceElementPerCardFaceDto>(cardFaceElementPerCardFace);
        }

        public async Task<IEnumerable<CardFaceElementPerCardFaceDto>> GetAllDtoAsync()
        {
           throw new NotImplementedException();
        }
        
        public async Task<CardFaceElementPerCardFaceDto?> GetDtoAsync(string id)
        {
            if (!Exists(id))
                return null;

            return _mapper.Map<CardFaceElementPerCardFaceDto>(await  _cardFaceElementPerCardFaceService.GetAsync(DtoIdConversion.DtoStringToLong(id)));
        }

        public async Task<bool> UpdateDtoAsync(string id, CardFaceElementPerCardFaceDto cardFaceElementPerCardFaceDto)
        {
            if (! Exists(id)) {
                return false;
            }

            CardFaceElementPerCardFace cardFaceElementPerCardFace = _mapper.Map<CardFaceElementPerCardFace>(cardFaceElementPerCardFaceDto);
            bool updated = await  _cardFaceElementPerCardFaceService.UpdateAsync(cardFaceElementPerCardFace.CardFaceElementPerCardFaceId, cardFaceElementPerCardFace);

            return updated;
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
           if (! Exists(id)) {
                return false;
            }

            bool deleted = await  _cardFaceElementPerCardFaceService.DeleteAsync(DtoIdConversion.DtoStringToLong(id));

            return deleted;
        }

        public async Task<CardFaceElementPerCardFaceDto> CreateDtoNavAsync(CardFaceElementPerCardFaceDto cardFaceElementPerCardFaceDto)
        {
            CardFaceElementPerCardFace cardFaceElementPerCardFace = _mapper.Map<CardFaceElementPerCardFace>(cardFaceElementPerCardFaceDto);
            await  _cardFaceElementPerCardFaceService.CreateNavAsync(cardFaceElementPerCardFace);
            return  _mapper.Map<CardFaceElementPerCardFaceDto>(cardFaceElementPerCardFace);
        }
        
        public async Task<CardFaceElementPerCardFaceDto?> GetDtoNavAsync(string id)
        {
            long snowflakeId = DtoIdConversion.DtoStringToLong(id);
            CardFaceElementPerCardFace? cardFaceElementPerCardFace = await  _cardFaceElementPerCardFaceService.GetNavAsync(snowflakeId);

            if (cardFaceElementPerCardFace == null)
            {
                return null;
            }

            return _mapper.Map<CardFaceElementPerCardFaceDto>(cardFaceElementPerCardFace);
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardFaceElementPerCardFaceDto cardFaceElementPerCardFaceDto)
        {
            if (! Exists(id)) {
                return false;
            }

            CardFaceElementPerCardFace cardFaceElementPerCardFace = _mapper.Map<CardFaceElementPerCardFace>(cardFaceElementPerCardFaceDto);
            bool updated = await  _cardFaceElementPerCardFaceService.UpdateNavAsync(cardFaceElementPerCardFace);

            return updated;
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            if (! Exists(id)) {
                return false;
            }

            bool deleted = await  _cardFaceElementPerCardFaceService.DeleteNavAsync(DtoIdConversion.DtoStringToLong(id));

            return deleted;
        }

        // TODO: Return cardFaceDto too
        public async Task<IEnumerable<CardFaceElementPerCardFaceDto>> CreateAllNavDtoByCardFaceDtoIdAsync(CardFaceElementPerCardFaceDto[] cardFaceElementsPerCardFaceDtos, CardFaceDto cardFaceDto)
        {
            try
            {
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
            return _cardFaceElementPerCardFaceService.Exists(DtoIdConversion.DtoStringToLong(id));
        }

        public async Task<CardPerOwnerDto> CreateDtoNavAsync(CardPerOwnerDto cardPerOwnerDto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, CardPerOwnerDto cardPerOwnerDto)
        {
           throw new NotImplementedException();
        }

        public async Task<bool> UpdateAllDtoNavByCardFaceAsync(CardFaceElementPerCardFaceDto[] cardFaceElementsPerCardFaceDto, CardFaceDto cardFaceDto)
        {
            CardFaceElementPerCardFace[] cardFaceElementsPerCardFace = _mapper.Map<CardFaceElementPerCardFace[]>(cardFaceElementsPerCardFaceDto);
            CardFace cardFace = _mapper.Map<CardFace>(cardFaceDto);
            return await _cardFaceElementPerCardFaceService.UpdateAllNavByCardFaceAsync(cardFaceElementsPerCardFace, cardFace);
        }
    }
}