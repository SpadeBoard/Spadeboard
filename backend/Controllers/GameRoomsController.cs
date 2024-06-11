using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.GameRooms;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameRoomsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GameRoomsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/GameRooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameRoom>>> GetGameRoom()
        {
            return await _context.GameRoom.ToListAsync();
        }

        // GET: api/GameRooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GameRoom>> GetGameRoom(int id)
        {
            var gameRoom = await _context.GameRoom.FindAsync(id);

            if (gameRoom == null)
            {
                return NotFound();
            }

            return gameRoom;
        }

        // PUT: api/GameRooms/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGameRoom(int id, GameRoom gameRoom)
        {
            if (id != gameRoom.GameRoomId)
            {
                return BadRequest();
            }

            _context.Entry(gameRoom).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GameRoomExists(id))
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

        // POST: api/GameRooms
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<GameRoom>> PostGameRoom(GameRoom gameRoom)
        {
            _context.GameRoom.Add(gameRoom);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetGameRoom", new { id = gameRoom.GameRoomId }, gameRoom);
        }

        // DELETE: api/GameRooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGameRoom(int id)
        {
            var gameRoom = await _context.GameRoom.FindAsync(id);
            if (gameRoom == null)
            {
                return NotFound();
            }

            _context.GameRoom.Remove(gameRoom);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GameRoomExists(int id)
        {
            return _context.GameRoom.Any(e => e.GameRoomId == id);
        }
    }
}
