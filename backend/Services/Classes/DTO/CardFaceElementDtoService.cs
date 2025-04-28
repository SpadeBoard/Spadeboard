using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;
using Models.DndItems;

namespace Services
{
    public class CardFaceElementDtoService(ApplicationDbContext context, ICardFaceElementPerCardFaceService cardFaceElementPerCardFaceService, ICardFaceService cardFaceService, IDndItemService dndItemService, IDndPositionService dndPositionService, ICardFaceElementService cardFaceElementService) : ICardFaceElementDtoService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICardFaceService _cardFaceService = cardFaceService;
        private readonly IDndItemService _dndItemService = dndItemService;
        private readonly IDndPositionService _dndPositionService = dndPositionService;
        private readonly ICardFaceElementService _cardFaceElementService = cardFaceElementService;
        private readonly ICardFaceElementPerCardFaceService _cardFaceElementPerCardFaceService = cardFaceElementPerCardFaceService ;
    
        public async Task CreateAllDtoAsync(CardFaceElementDto[] cardFaceElementsDto, CardFace cardFace)
        {
            foreach (CardFaceElementDto cardFaceElementDto in cardFaceElementsDto) {
                cardFaceElementDto.CardFaceElement.CardFace = cardFace;
                await CreateDtoAsync(cardFaceElementDto, cardFace);
            }
        }

        public async Task CreateDtoAsync(CardFaceElementDto cardFaceElementDto, CardFace cardFace)
        {
            CardFaceElementPerCardFace c = new(){
                CardFaceElement = cardFaceElementDto.CardFaceElement,
                DndItem = cardFaceElementDto.DndItemDto.DndItem,
                DndPosition = cardFaceElementDto.DndItemDto.DndPosition,
                CardFace = cardFace
            };

            await _cardFaceElementPerCardFaceService.CreateNavAsync(c);

            cardFaceElementDto.CardFaceElement = c.CardFaceElement;
            cardFaceElementDto.DndItemDto.DndItem = c.DndItem;
            cardFaceElementDto.DndItemDto.DndPosition = c.DndPosition;
        }

        public async Task<IEnumerable<CardFaceElementDto>> GetAllDtoByCardFaceIdAsync(int cardFaceId)
        {
            throw new NotImplementedException();
            // TODO: Replace with the CardEditorCardFaceDto
            /*var cfepcfs = await _cardFaceElementPerCardFaceService.GetAllNavCardFaceIdAsync(cardFaceId);
            List<CardFaceElementDto> list = [];
            
            if (cfepcfs != null)
            {
                foreach (var c in cfepcfs)
                {
                    list.Add(new CardFaceElementDto
                    {
                        CardFaceElement = c.CardFaceElement,
                        DndItemDto = new DndItemDto
                        {
                            DndItem = c.DndItem,      // Ensure these properties exist on 'c'
                            DndPosition = c.DndPosition
                        }
                    });
                }
            }

            return list;*/
        }

        public async Task<CardFaceElementDto?> GetDtoAsync(int id)
        {
            throw new NotImplementedException();
            /*var cardFaceElementPerCardFaceAsync = await _cardFaceElementPerCardFaceService.GetAllNavByCardFaceElementIdAndCardFaceIdAsync(cardFaceElementId, cardFaceId);
            if (cardFaceElementPerCardFaceAsync == null)
            {
                return null;
            }

            var cardFaceElement = await _cardFaceElementService.GetNavAsync(cardFaceElementPerCardFaceAsync.CardFaceElementId);
            if (cardFaceElement == null)
            {
                return null;
            }

            var dndItemDto = await _dndItemService.GetByDndItemIdAndDndPositionIdAsync(cardFaceElementPerCardFaceAsync.DndItemId, cardFaceElementPerCardFaceAsync.DndPositionId);
            
            if (dndItemDto == null) {
                return null;
            }
            
            // Object reference not set to an instance of an object.
            CardFaceElementDto cardFaceElementDto = new() { // Object reference not set to an instance of an object
                CardFaceElement = cardFaceElement,
                // DndItemDto = dndItemDto
            };

            return cardFaceElementDto;*/
        }

        public async Task UpdateAllDtoAsync(CardFaceElementDto[] cardFaceElementsDto)
        {
            foreach (CardFaceElementDto cardFaceElementDto in cardFaceElementsDto)
            {
                await UpdateDtoAsync(cardFaceElementDto);
            }
        }

        public async Task UpdateDtoAsync(CardFaceElementDto cardFaceElementDto)
        {
            if (cardFaceElementDto.CardFaceElement.Style != null)
            {
                _context.Entry(cardFaceElementDto.CardFaceElement.Style).State = EntityState.Modified;
            }

            if (cardFaceElementDto.DndItemDto.DndItem != null)
            {
                _context.Entry(cardFaceElementDto.DndItemDto.DndItem).State = EntityState.Modified;
            }

            if (cardFaceElementDto.DndItemDto.DndPosition != null)
            {
                _context.Entry(cardFaceElementDto.DndItemDto.DndPosition).State = EntityState.Modified;
            }

            if (cardFaceElementDto.DndItemDto.DndDragBoundary != null)
            {
                _context.Entry(cardFaceElementDto.DndItemDto.DndDragBoundary).State = EntityState.Modified;
            }

            context.Entry(cardFaceElementDto.CardFaceElement).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_cardFaceElementService.Exists(cardFaceElementDto.CardFaceElement.CardFaceElementId))
                {
                    throw;
                }
                else
                {
                    throw;
                }
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}