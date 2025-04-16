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
            return await _context.CardPositionPerRoom.ToListAsync();
        }

        // GET: api/CardPositionPerRooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CardPositionPerRoom>> GetCardPositionPerRoom(int id)
        {
            var cardPositionPerRoom = await _cardPositionPerRoomService.GetCardPositionPerRoomAsync(id);

            if (cardPositionPerRoom == null)
            {
                return NotFound();
            }

            return cardPositionPerRoom;
        }

        [HttpGet("room/{gameRoomId}")]
        public async Task<ActionResult<IEnumerable<CardPositionPerRoom>>> GetCardsPositionPerRoomByRoomId(int gameRoomId)
        {
            var cprs = await _cardPositionPerRoomService.GetCardsPositionPerRoomNavByRoomIdAsync(gameRoomId);

            return Ok(cprs);
        }

        // PUT: api/CardPositionPerRooms/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCardPositionPerRoom(int id, CardPositionPerRoom cardPositionPerRoom)
        {
            if (id != cardPositionPerRoom.CardPositionPerRoomId)
            {
                return BadRequest();
            }

            _context.Entry(cardPositionPerRoom).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CardPositionPerRoomExists(id))
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

        // POST: api/CardPositionPerRooms
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CardPositionPerRoom>> PostCardPositionPerRoom(CardPositionPerRoom cardPositionPerRoom)
        {
            await _cardPositionPerRoomService.CreateCardPositionPerRoomAsync(cardPositionPerRoom);
            return CreatedAtAction("GetCardPositionPerRoom", new { id = cardPositionPerRoom.CardPositionPerRoomId }, cardPositionPerRoom);
        }

        // DELETE: api/CardPositionPerRooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCardPositionPerRoom(int id)
        {
            var cardPositionPerRoom = await _context.CardPositionPerRoom.FindAsync(id);
            if (cardPositionPerRoom == null)
            {
                return NotFound();
            }

            _context.CardPositionPerRoom.Remove(cardPositionPerRoom);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CardPositionPerRoomExists(int id)
        {
            return _cardPositionPerRoomService.Exists(id);
        }
    }
}
