using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.GameRooms;
using Services;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameRoomsController(IGameRoomDtoService gameRoomDtoService) : ControllerBase
    {
        private readonly IGameRoomDtoService _gameRoomDtoService = gameRoomDtoService;

        // GET: api/GameRooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameRoomDto>>> GetGameRoom()
        {
             var gr = await _gameRoomDtoService.GetAllDtoAsync();

            if (gr== null)
            {
                return NotFound();
            }

            return Ok(gr);
        }

        // GET: api/GameRooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GameRoomDto>> GetGameRoom(string id)
        {
            var gameRoom = await _gameRoomDtoService.GetDtoAsync(id);

            if (gameRoom == null)
            {
                return NotFound();
            }

            return gameRoom;
        }

        // PUT: api/GameRooms/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGameRoom(string id, GameRoomDto gameRoom)
        {
            var result = await _gameRoomDtoService.UpdateDtoAsync(id, gameRoom);

            if (result == true)
                return NoContent();

            // Could be either bad request or not found, you may want to distinguish these
            if (id != gameRoom.GameRoomId)
                return BadRequest();

            return NotFound();
        }

        // POST: api/GameRooms
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<GameRoomDto>> PostGameRoom(GameRoomDto gameRoom)
        {
            GameRoomDto newGameRoom= await _gameRoomDtoService.CreateDtoAsync(gameRoom);
            return CreatedAtAction("GetCard", new { id = newGameRoom.GameRoomId }, newGameRoom);
        }

        // DELETE: api/GameRooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGameRoom(string id)
        {
            var deleted = await _gameRoomDtoService.DeleteDtoAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
