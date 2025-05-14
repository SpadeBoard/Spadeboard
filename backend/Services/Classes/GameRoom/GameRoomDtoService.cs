using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Models.GameRooms;

namespace Services
{
    public class GameRoomDtoService: IGameRoomDtoService
    {
        public bool Exists(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<GameRoomDto>> GetAllDtoAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<GameRoomDto?> GetDtoAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<GameRoomDto> CreateDtoAsync(GameRoomDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoAsync(string id, GameRoomDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateDtoNavAsync(string id, GameRoomDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<GameRoomDto?> GetDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }

        public async Task<GameRoomDto> CreateDtoNavAsync(GameRoomDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteDtoNavAsync(string id)
        {
            throw new NotImplementedException();
        }
    }
}