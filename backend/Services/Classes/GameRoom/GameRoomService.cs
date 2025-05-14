using Data;
using Models.GameRooms;
using Microsoft.EntityFrameworkCore;

namespace Services
{
    public class GameRoomService(ApplicationDbContext context) : IGameRoomService
    {
        private readonly CrudService<GameRoom> _crudService = new(context, gr => gr.GameRoomId);

        public async Task<GameRoom> CreateAsync(GameRoom item)
        {
            return await _crudService.CreateAsync(item);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }

        public bool Exists(long id)
        {
            return _crudService.Exists(id);
        }

        public bool IsModified(GameRoom item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<GameRoom>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<GameRoom?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, GameRoom item)
        {
            return await _crudService.UpdateAsync(id, item);
        }
    }
}