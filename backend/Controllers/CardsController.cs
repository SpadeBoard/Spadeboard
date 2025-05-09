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
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardsController(ICardEditorCardDtoService cardEditorCardDtoService, ICardDtoService cardDtoService, ICardPerOwnerDtoService cardPerOwnerDtoService) : ControllerBase
    {
        private readonly ICardDtoService _cardDtoService = cardDtoService;

        private readonly ICardPerOwnerDtoService _cardPerOwnerDtoService = cardPerOwnerDtoService;
        
        private readonly ICardEditorCardDtoService _cardEditorCardDtoService = cardEditorCardDtoService;
        
        // GET: api/Cards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CardDto>>> GetCard()
        {
            var cards = await _cardDtoService.GetAllDtoAsync();

            if (cards == null)
            {
                return NotFound();
            }

            return Ok(cards);
        }

        // GET: api/Cards/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardDto>> GetCard(string id)
        {
            var card = await _cardDtoService.GetDtoAsync(id);

            if (card == null)
            {
                return NotFound();
            }

            return card;
        }

        // FIXME: Pass in ID instead
        [HttpGet("dto/{id}")]
        public async Task<ActionResult<CardEditorCardDto>> GetCardEditorCardDto(string id)
        {
            var cardEditorCardDto = await _cardEditorCardDtoService.GetDtoAsync(id);

            if (cardEditorCardDto == null)
            {
                return NotFound();
            }

            return cardEditorCardDto;
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<ActionResult<IEnumerable<CardDto>>> GetCardsByOwner(string ownerId)
        {
            return (await _cardPerOwnerDtoService.GetCardsDtoByOwnerIdAsync(ownerId)).ToList();
        }

        [HttpGet("owner/{ownerId}/{cardId}")]
        public async Task<ActionResult<CardDto>> GetCardByOwner(string ownerId, string cardId)
        {
            CardPerOwnerDto? cpo = await _cardPerOwnerDtoService.GetDtoByCardIdAndOwnerIdAsync(cardId, ownerId);

            if (cpo == null)
            {
                return NotFound();
            }

            CardDto? card = await _cardDtoService.GetDtoAsync(cpo.CardId);

            if (card == null)
            {
                return NotFound();
            }

            return Ok(card);
        }

        // PUT: api/Cards/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCard(string id, CardDto card)
        {
            var result = await _cardDtoService.UpdateDtoAsync(id, card);

            if (result == true)
                return NoContent();

            // Could be either bad request or not found, you may want to distinguish these
            if (id != card.CardId)
                return BadRequest();

            return NotFound();
        }

        [HttpPut("dto/{id}")]
        public async Task<IActionResult> PutCardEditorCardDto(string id, CardEditorCardDto cardEditorCardDto)
        {
            try
            {
                var updated = await _cardEditorCardDtoService.UpdateDtoAsync(id, cardEditorCardDto);         
                return updated ? Ok(cardEditorCardDto) : BadRequest();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
            catch (Exception ex) 
            {
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
        }

        // POST: api/Cards
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CardDto>> PostCard(CardDto card)
        {
            CardDto newCard= await _cardDtoService.CreateDtoAsync(card);
            return CreatedAtAction("GetCard", new { id = newCard.CardId }, newCard);
        }

        // https://stackoverflow.com/a/70951248
        // Function overriding

        // https://stackoverflow.com/questions/53854416/error-action-has-more-than-one-parameter-bound-from-request-body

        // https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-9.0
        // https://learn.microsoft.com/en-us/aspnet/web-api/overview/data/using-web-api-with-entity-framework/part-5
        [HttpPost("dto")]
        public async Task<ActionResult<CardEditorCardDto>> PostCardEditorCardDto(CardEditorCardDto cardEditorCardDto)
        {
            try
            {
                CardEditorCardDto newCardEditorCardDto = await _cardEditorCardDtoService.CreateDtoAsync(cardEditorCardDto);           
                return CreatedAtAction("GetCardEditorCardDto", new { id = newCardEditorCardDto.Card.CardId }, newCardEditorCardDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
        }

         [HttpPost("dto/create-from-existing")]
        public async Task<ActionResult<CardEditorCardDto>> PostCardEditorCardDtoFromExistingDto(CardEditorCardDto cardEditorCardDto)
        {
            Console.WriteLine("Post card DTO");

            // TODO: Pass in the DndItem and DndPosition separately, add those to CardEditorCardDto, make sure that the frontend also pass them in separately somehow?
            // TODO:  When adding elements, there will be a style, so that should be handled
            try
            {
                // TODO: Don't return the card, return the DTO
                await _cardEditorCardDtoService.CreateDtoFromExistingDtoAsync(cardEditorCardDto);
                return CreatedAtAction("GetCardEditorCardDto", new { id = cardEditorCardDto.Card.CardId }, cardEditorCardDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
        }

         [HttpPost("dto/game-room")]
        public async Task<ActionResult<CardEditorCardDto>> PostCardEditorCardDtoForGameRoomFromExistingDto(CardEditorCardDto cardEditorCardDto)
        {
            Console.WriteLine("Post card DTO");

            // TODO: Pass in the DndItem and DndPosition separately, add those to CardEditorCardDto, make sure that the frontend also pass them in separately somehow?
            // TODO:  When adding elements, there will be a style, so that should be handled
            try
            {
                // TODO: Don't return the card, return the DTO
                await _cardEditorCardDtoService.CreateDtoForGameRoomFromExistingDtoAsync(cardEditorCardDto);
                return CreatedAtAction("GetCardEditorCardDto", new { id = cardEditorCardDto.Card.CardId }, cardEditorCardDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
        }

        // DELETE: api/Cards/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCard(string id)
        {
            var deleted = await _cardDtoService.DeleteDtoAsync(id);
            return deleted ? NoContent() : NotFound();
        }

        [HttpDelete("dto/{id}")]
        public async Task<IActionResult> DeleteCardEditorCardDto(string id)
        {
            try
            {
                var deleted = await _cardEditorCardDtoService.DeleteDtoAsync(id);
                return deleted ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
        }
    }
}
