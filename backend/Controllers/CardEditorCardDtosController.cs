using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Services;
using Models.Cards;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardEditorCardDtosController(ICardEditorCardDtoService cardEditorCardDtoService) : ControllerBase
    {
         private readonly ICardEditorCardDtoService _cardEditorCardDtoService = cardEditorCardDtoService;
    
         [HttpGet("{id}")]
        public async Task<ActionResult<CardEditorCardDto>> GetCardEditorCardDto(string id)
        {
            var cardEditorCardDto = await _cardEditorCardDtoService.GetDtoAsync(id);

            if (cardEditorCardDto == null)
            {
                return NotFound();
            }

            return Ok(cardEditorCardDto);
        }

        // https://stackoverflow.com/a/70951248
        // Function overriding

        // https://stackoverflow.com/questions/53854416/error-action-has-more-than-one-parameter-bound-from-request-body

        // https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-9.0
        // https://learn.microsoft.com/en-us/aspnet/web-api/overview/data/using-web-api-with-entity-framework/part-5
        [HttpPost]
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

         [HttpPut("{id}")]
        public async Task<IActionResult> PutCardEditorCardDto(string id, CardEditorCardDto cardEditorCardDto)
        {
            try
            {
                var updated = await _cardEditorCardDtoService.UpdateDtoAsync(id, cardEditorCardDto);         
                return updated ? Ok(await _cardEditorCardDtoService.GetDtoAsync(id)) : BadRequest();
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

        [HttpDelete("{id}")]
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