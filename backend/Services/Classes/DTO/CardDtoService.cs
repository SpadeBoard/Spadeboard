using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using Models.Bridge;

// https://stackoverflow.com/questions/59753218/how-to-use-dbcontext-in-separate-class-library-net-core
// https://www.postgresql.org/docs/current/ddl-schemas.html#:~:text=Unlike%20databases%2C%20schemas%20are%20not,without%20interfering%20with%20each%20other.

// Main schema: bridge tables containing item, dnd position, game room id as well as bridge tables containing item ID and user ID


namespace Services
{
    public class CardDtoService(ApplicationDbContext context, ICardService cardService, ICardFaceService cardFaceService, ICardPerOwnerService cardPerOwnerService, ICardFaceElementService cardFaceElementService) : ICardDtoService
    {
        private readonly ICardService _cardService = cardService;

        private readonly ICardPerOwnerService _cardPerOwnerService = cardPerOwnerService;

        private readonly ICardFaceService _cardFaceService = cardFaceService;

        private readonly ICardFaceElementService _cardFaceElementService = cardFaceElementService;

        private readonly ApplicationDbContext _context = context;

        public Task CreateDtoAsync(CardDto dto)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteDtoAsync(CardDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task<CardDto?> GetDtoAsync(int id)
        {
            Card? card = await _cardService.GetNavAsync(id);
            
            if (card == null)
            {
                return null;
            }

            CardDto cardDto = new()
            {
                Card = card
            };
            
            CardFace? frontCardFace = await _cardFaceService.GetNavAsync(card.FrontCardFaceId);
            CardFace? backCardFace = await _cardFaceService.GetNavAsync(card.BackCardFaceId);
            
            if (frontCardFace == null && backCardFace == null)
            {
                return null;
            }

            if (frontCardFace != null)
                cardDto.FrontCardFace = frontCardFace;

            if (backCardFace != null)
                cardDto.BackCardFace = backCardFace;

            var frontCardFaceElementsDto = await _cardFaceElementService.GetAllDtoByCardFaceIdAsync(card.FrontCardFaceId);
            var backCardFaceElementsDto = await _cardFaceElementService.GetAllDtoByCardFaceIdAsync(card.BackCardFaceId);

            if (frontCardFaceElementsDto != null) {
                cardDto.FrontCardFaceElementsDto = frontCardFaceElementsDto.ToArray<CardFaceElementDto>();
            }

            if (backCardFaceElementsDto != null) {
                cardDto.BackCardFaceElementsDto = backCardFaceElementsDto.ToArray<CardFaceElementDto>();
            }

            CardPerOwner? cpo = await _cardPerOwnerService.GetCardPerOwnerByCardIdAsync(cardDto.Card.CardId);

            if (cpo != null) 
            {
                cardDto.OwnerId = cpo.OwnerId;
            } 

              // FIXME: Grab the styling for the card face elements as well as card faces
            return cardDto;
        }

        public async Task UpdateDtoAsync(CardDto cardDto)
        {
            throw new NotImplementedException();
        }
    }
}