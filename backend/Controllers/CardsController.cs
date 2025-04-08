using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using System.Configuration;
using Microsoft.Build.Exceptions;
using Services;
using Models.Bridge;
using Newtonsoft.Json;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardsController(ApplicationDbContext context, ICardService cardService, ICardFaceService cardFaceService, ICardFaceElementService cardFaceElementService) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        private readonly ICardService _cardService = cardService;

        private readonly ICardFaceService _cardFaceService = cardFaceService;

        private readonly ICardFaceElementService _cardFaceElementService = cardFaceElementService;

        // GET: api/Cards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Card>>> GetCard()
        {
            return await _context.Card.ToListAsync();
        }

        // GET: api/Cards/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Card>> GetCard(int id)
        {
            var card = await _context.Card.FindAsync(id);

            if (card == null)
            {
                return NotFound();
            }

            return card;
        }

        // FIXME: Pass in ID instead
        [HttpGet("dto/{id}")]
        public async Task<ActionResult<CardDto>> GetCardDto(int id)
        {
            Card? card = await _context.Card
                .Include(c => c.FrontCardFace)
                .Include(c => c.BackCardFace)
                .FirstOrDefaultAsync(c => c.CardId == id);

            
            if (card == null)
            {
                return NotFound();
            }

            CardDto cardDto = new()
            {
                Card = card
            };

            CardFace? frontCardFace = await _context.CardFace.FindAsync(card.FrontCardFaceId);
            CardFace? backCardFace = await _context.CardFace.FindAsync(card.BackCardFaceId);
            
            if (frontCardFace == null && backCardFace == null)
            {
                return NotFound();
            }

            if (frontCardFace != null)
                cardDto.FrontCardFace = frontCardFace;

            if (backCardFace != null)
                cardDto.BackCardFace = backCardFace;

            // TODO: Replace with getting the elements DTO
            /*var frontCardFaceElements = await _cardFaceElementService.GetCardFaceElementsByCardFaceIdAsync(card.FrontCardFaceId);
            var backCardFaceElements = await _cardFaceElementService.GetCardFaceElementsByCardFaceIdAsync(card.BackCardFaceId);

            if (frontCardFaceElements != null) {
                cardDto.FrontCardFaceElements = frontCardFaceElements.ToArray<CardFaceElement>();
            }

            if (backCardFaceElements != null) {
                cardDto.BackCardFaceElements = backCardFaceElements.ToArray<CardFaceElement>();
            }*/

            // TODO: Remove between these two TODOs
            // Object reference not set to an instance of an object.
            var frontCardFaceElementsDto = await _cardFaceElementService.GetCardFaceElementsDtoByCardFaceIdAsync(card.FrontCardFaceId);
            var backCardFaceElementsDto = await _cardFaceElementService.GetCardFaceElementsDtoByCardFaceIdAsync(card.BackCardFaceId);

            if (frontCardFaceElementsDto != null) {
                cardDto.FrontCardFaceElementsDto = frontCardFaceElementsDto.ToArray<CardFaceElementDto>();
            }

            if (backCardFaceElementsDto != null) {
                cardDto.BackCardFaceElementsDto = backCardFaceElementsDto.ToArray<CardFaceElementDto>();
            }

            // FIXME: Grab the styling for the card face elements as well as card faces
            return cardDto;
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<ActionResult<IEnumerable<Card>>> GetCardsByOwner(string ownerId)
        {
            var cards = (await _cardService.GetCardsByOwner(ownerId)).ToList();

            if (cards == null)
            {
                return NotFound();
            }

            return cards;
        }

        // PUT: api/Cards/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCard(int id, Card card)
        {
            if (id != card.CardId)
            {
                return BadRequest();
            }

            _context.Entry(card).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CardExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPut("dto/{id}")]
        public async Task<IActionResult> PutCardDto(int id, CardDto cardDto)
        {
            if (id != cardDto.Card.CardId)
            {
                return BadRequest();
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // TODO
                // 1. Grab the card
                // 2. Grab the foreign keys of the card
                // 3. Get those card faces and card face elements based on the card Dto
                // 4. Then update and return it
                _context.Entry(cardDto.Card).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                if (cardDto.FrontCardFace != null) 
                {
                    await _cardFaceService.UpdateCardFaceDtoAsync(cardDto.FrontCardFace);
                }

                if (cardDto.BackCardFace != null) 
                {
                    await _cardFaceService.UpdateCardFaceDtoAsync(cardDto.BackCardFace);
                }

                // TODO: Remove
                /*if (cardDto.FrontCardFaceElements != null)
                {
                    await _cardFaceElementService.UpdateCardFaceElementsNavAsync(cardDto.FrontCardFaceElements);
                }

                if (cardDto.BackCardFaceElements != null)
                {
                    await _cardFaceElementService.UpdateCardFaceElementsNavAsync(cardDto.BackCardFaceElements);
                }*/
                // TODO: between these

                if (cardDto.FrontCardFaceElementsDto != null)
                {
                    await _cardFaceElementService.UpdateCardFaceElementsDtoAsync(cardDto.FrontCardFaceElementsDto);
                }

                if (cardDto.BackCardFaceElementsDto != null)
                {
                    await _cardFaceElementService.UpdateCardFaceElementsDtoAsync(cardDto.BackCardFaceElementsDto);
                }

                await transaction.CommitAsync();
                return Ok(cardDto);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                await transaction.RollbackAsync();

                if (!CardExists(id))
                {
                    return NotFound();
                }
                else
                {
                    return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
                }
            }
            catch (Exception ex) 
            {
                await transaction.RollbackAsync();
                
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
        }

        // POST: api/Cards
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Card>> PostCard(Card card)
        {
            _context.Card.Add(card);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCard", new { id = card.CardId }, card);
        }

        // https://stackoverflow.com/a/70951248
        // Function overriding

        // https://stackoverflow.com/questions/53854416/error-action-has-more-than-one-parameter-bound-from-request-body
        /*
        Unhandled exception. 
        System.InvalidOperationException: Action 'backend.Controllers.CardsController.PostCard (backend)' has more than one parameter that was specified or inferred as bound from request body. 
        Only one parameter per action may be bound from body. Inspect the following parameters, and use 'FromQueryAttribute' to specify bound from query, 
        'FromRouteAttribute' to specify bound from route, and 'FromBodyAttribute' for parameters to be bound from body:
        */

        // https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-9.0
        // https://learn.microsoft.com/en-us/aspnet/web-api/overview/data/using-web-api-with-entity-framework/part-5
        [HttpPost("dto")]
        public async Task<ActionResult<CardDto>> PostCardDto(CardDto cardDto)
        {
            // TODO: Pass in the DndItem and DndPosition separately, add those to CardDto, make sure that the frontend also pass them in separately somehow?
            // TODO:  When adding elements, there will be a style, so that should be handled
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // FIXME: Can add styling and card face even though card already exists, so what we want to do is check the model state?
                // https://learn.microsoft.com/en-us/ef/core/saving/transactions
                // Might have to use transactions to control this
                // TODO: Modify this, this is temporary
                if (cardDto.FrontCardFace.Style != null)
                {
                    _context.Style.Add(cardDto.FrontCardFace.Style);

                    await _context.SaveChangesAsync();

                    int frontCardFaceStyleId = cardDto.FrontCardFace.Style.StyleId;

                    // FIXME: Temporary styling
                    // cardDto.FrontCardFace.StyleId = frontCardFaceStyleId;
                    // cardDto.FrontCardFace.Style = cardDto.FrontCardFaceStyle;
                }

                if (cardDto.BackCardFace.Style != null)
                {
                    _context.Style.Add(cardDto.BackCardFace.Style);

                    await _context.SaveChangesAsync();

                    int backCardFaceStyleId = cardDto.BackCardFace.Style.StyleId;

                    // FIXME: Temporary styling
                    // cardDto.BackCardFace.StyleId =  backCardFaceStyleId;
                    // cardDto.BackCardFace.Style = cardDto.BackCardFaceStyle;
                }

                if (cardDto.FrontCardFace.Style != null && cardDto.BackCardFace.Style != null)
                    Console.WriteLine(String.Format("Front card face style ID: {0}, back card face style ID: {1}\nFront card face sttyle FK: {2}, back card face style FK: {3}", cardDto.FrontCardFace.Style.StyleId, cardDto.BackCardFace.Style.StyleId, cardDto.FrontCardFace.StyleId, cardDto.BackCardFace.StyleId));


                // FIXED: Making sure the front card face ID and back card face ID generate IDs, only works with 0
                // Probably a band-aid solution but oh well
                cardDto.FrontCardFace.CardFaceId = 0;
                cardDto.BackCardFace.CardFaceId = 0;

                // CHECKME: It actually saves the front card face first
                _context.CardFace.Add(cardDto.FrontCardFace);
                _context.CardFace.Add(cardDto.BackCardFace);

                await _context.SaveChangesAsync();

                // https://stackoverflow.com/a/41146434
                // It is pretty easy. If you are using DB generated Ids (like IDENTITY in MS SQL) you just need to add entity to ObjectSet and SaveChanges on related ObjectContext. Id will be automatically filled for you:
                // CHECKME: Actually works with Postgres

                int frontCardFaceId = cardDto.FrontCardFace.CardFaceId;
                int backCardFaceId = cardDto.BackCardFace.CardFaceId;

                // TODO: Modify this to also add the DND items, gotta use that service, pass in CardFaceElementsDto
                /*if (cardDto.FrontCardFaceElements != null)
                    await _cardFaceElementService.CreateCardFaceElementsNavCardFaceAsync(cardDto.FrontCardFaceElements, cardDto.FrontCardFace);

                if (cardDto.BackCardFaceElements != null)
                    await _cardFaceElementService.CreateCardFaceElementsNavCardFaceAsync(cardDto.BackCardFaceElements, cardDto.BackCardFace);

                if (cardDto.FrontCardFaceElements != null || cardDto.BackCardFaceElements != null)
                    await _context.SaveChangesAsync();*/

                // TODO: Remove between these two TODOs
                // TODO: For the elements DTO, create them
                // FIXME: Not adding correct, why is that
                if (cardDto.FrontCardFaceElementsDto != null)
                    await _cardFaceElementService.CreateCardFaceElementsDtoAsync(cardDto.FrontCardFaceElementsDto, cardDto.FrontCardFace);

                if (cardDto.BackCardFaceElementsDto != null)
                    await _cardFaceElementService.CreateCardFaceElementsDtoAsync(cardDto.BackCardFaceElementsDto, cardDto.BackCardFace);

                if (cardDto.FrontCardFaceElementsDto != null || cardDto.BackCardFaceElementsDto != null)
                    await _context.SaveChangesAsync();

                // TODO: Log the elements DTO, why are they done
                // FIXME: None
                Console.WriteLine("Card Face Elements Created - Front: {0}, Back: {1}",
                    cardDto.FrontCardFaceElementsDto != null 
                        ? JsonConvert.SerializeObject(cardDto.FrontCardFaceElementsDto, Formatting.Indented) 
                        : "none",
                    cardDto.BackCardFaceElementsDto != null 
                        ? JsonConvert.SerializeObject(cardDto.BackCardFaceElementsDto, Formatting.Indented) 
                        : "none");
                /*
                MessageText: insert or update on table "Cards" violates foreign key constraint "FK_Cards_CardFaces_BackCardFaceId"
                Detail: Key (BackCardFaceId)=(-1) is not present in table "CardFaces".
                SchemaName: public
                */

                cardDto.Card.FrontCardFaceId = frontCardFaceId;
                cardDto.Card.BackCardFaceId = backCardFaceId;
                // cardDto.Card.DndItemId = 1; // This is seeded data

                cardDto.Card.FrontCardFace = cardDto.FrontCardFace;
                cardDto.Card.BackCardFace = cardDto.BackCardFace;

                Console.WriteLine(String.Format("Front card face ID: {0}, back card face ID: {1}", cardDto.FrontCardFace.CardFaceId, cardDto.BackCardFace.CardFaceId));

                _context.Card.Add(cardDto.Card);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // TODO: Don't return the card, return the DTO
                return CreatedAtAction("GetCardDto", new { id = cardDto.Card.CardId }, cardDto);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
        }

        // DELETE: api/Cards/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCard(int id)
        {
            var card = await _context.Card.FindAsync(id);
            if (card == null)
            {
                return NotFound();
            }

            _context.Card.Remove(card);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("dto/{id}")]
        public async Task<IActionResult> DeleteCardDto(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cardDto = (await GetCardDto(id)).Value;
                if (cardDto == null)
                {
                    return NotFound();
                }

                _context.Card.Remove(cardDto.Card);
                await _context.SaveChangesAsync();

                if (cardDto.FrontCardFace != null)
                {
                    Console.WriteLine(String.Format("Front card face ID (delete): {0}", cardDto.FrontCardFace.CardFaceId));
                    var cardFaceElements = await _cardFaceElementService.GetCardFaceElementsByCardFaceIdAsync(cardDto.FrontCardFace.CardFaceId);

                    if (cardFaceElements != null)
                    {
                        await _cardFaceElementService.DeleteCardFaceElementsNavAsync(cardFaceElements.ToArray());
                    }
                }

                if (cardDto.BackCardFace != null)
                {
                    Console.WriteLine(String.Format("Back card face ID (delete): {0}", cardDto.BackCardFace.CardFaceId));
                    var cardFaceElements = await _cardFaceElementService.GetCardFaceElementsByCardFaceIdAsync(cardDto.BackCardFace.CardFaceId);

                    if (cardFaceElements != null)
                    {
                        await _cardFaceElementService.DeleteCardFaceElementsNavAsync(cardFaceElements.ToArray());
                    }
                }

                if (cardDto.FrontCardFace != null)
                {
                    Console.WriteLine("Delete front card face");
                    await _cardFaceService.DeleteCardFaceDtoAsync(cardDto.FrontCardFace);
                }

                if (cardDto.BackCardFace != null)
                {
                    Console.WriteLine("Delete back card face");
                    await _cardFaceService.DeleteCardFaceDtoAsync(cardDto.BackCardFace);
                }

                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
        }

        private bool CardExists(int id)
        {
            return _context.Card.Any(e => e.CardId == id);
        }
    }
}
