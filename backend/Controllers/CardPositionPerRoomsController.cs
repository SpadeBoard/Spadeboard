using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Services;
using Models.Bridge;
using System.Text.Json;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardPositionPerRoomsController(ApplicationDbContext context, ICardPositionPerRoomService cardPositionPerRoomService) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        private readonly ICardPositionPerRoomService _cardPositionPerRoomService = cardPositionPerRoomService;

        // GET: api/CardPositionPerRooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CardPositionPerRoom>>> GetCardPositionPerRoom()
        {
            var cprs = await _cardPositionPerRoomService.GetAllAsync();

            if (cprs == null)
            {
                return NotFound();
            }

            return Ok(cprs);
        }

        // GET: api/CardPositionPerRooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardPositionPerRoom>> GetCardPositionPerRoom(int id)
        {
            var cardPositionPerRoom = await _cardPositionPerRoomService.GetAsync(id);

            if (cardPositionPerRoom == null)
            {
                return NotFound();
            }

            return cardPositionPerRoom;
        }

        [HttpGet("nav/{id}")]
        public async Task<ActionResult<CardPositionPerRoom>> GetCardPositionPerRoomNav(int id)
        {
            var cardPositionPerRoom = await _cardPositionPerRoomService.GetNavAsync(id);

            if (cardPositionPerRoom == null)
            {
                return NotFound();
            }

            return cardPositionPerRoom;
        }

        [HttpGet("nav/room/{gameRoomId}")]
        public async Task<ActionResult<IEnumerable<CardPositionPerRoom>>> GetCardsPositionPerRoomNavByRoomId(int gameRoomId)
        {
            var cprs = await _cardPositionPerRoomService.GetAllNavByRoomIdAsync(gameRoomId);

            return Ok(cprs);
        }

        // PUT: api/CardPositionPerRooms/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCardPositionPerRoom(int id, CardPositionPerRoom cardPositionPerRoom)
        {
            var result = await _cardPositionPerRoomService.UpdateAsync(id, cardPositionPerRoom);

            if (result == true)
                return NoContent();

            // Could be either bad request or not found, you may want to distinguish these
            if (id != cardPositionPerRoom.CardPositionPerRoomId)
                return BadRequest();

            return NotFound();
        }

        [HttpPut("nav")]
        public async Task<IActionResult> PutCardPositionPerRoomAllNav(CardPositionPerRoom[] cprs)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                Console.WriteLine("Put CPR all nav: Check length");

                if (cprs.Length <= 0)
                    return BadRequest();

                Console.WriteLine("Put CPR all nav: CPRS length is higher than 0");

                bool updated = await _cardPositionPerRoomService.UpdateAllNavAsync(cprs);
                
                Console.WriteLine("Has updated: {0}", updated);

                if (updated)
                {
                    await transaction.CommitAsync();
                    return Ok(cprs);
                }

                return BadRequest();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
            catch (Exception ex) 
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
        }

        // POST: api/CardPositionPerRooms
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        
        // FIXME: Why is this undefined
        [HttpPost]
        public async Task<ActionResult<CardPositionPerRoom>> PostCardPositionPerRoom(CardPositionPerRoom cardPositionPerRoom)
        {
            await _cardPositionPerRoomService.CreateAsync(cardPositionPerRoom);
            return CreatedAtAction("GetCardPositionPerRoom", new { id = cardPositionPerRoom.CardPositionPerRoomId }, cardPositionPerRoom);
        }

        [HttpPost("nav")]
        public async Task<ActionResult<CardPositionPerRoom>> PostCardPositionPerRoomNav(CardPositionPerRoom cardPositionPerRoom)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _cardPositionPerRoomService.CreateNavAsync(cardPositionPerRoom);

                string navJson = JsonSerializer.Serialize(cardPositionPerRoom);
                Console.WriteLine(navJson);

                await transaction.CommitAsync();
                return CreatedAtAction("GetCardPositionPerRoom", new { id = cardPositionPerRoom.CardPositionPerRoomId }, cardPositionPerRoom);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while processing the request", error = ex.Message });
            }
        }

        // DELETE: api/CardPositionPerRooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCardPositionPerRoom(int id)
        {
            var deleted = await _cardPositionPerRoomService.DeleteAsync(id);
            if (deleted == false)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
