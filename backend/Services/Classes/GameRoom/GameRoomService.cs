using Data;
using Models.GameRooms;

namespace Services
{
    public class GameRoomService(ApplicationDbContext context) : IGameRoomService
    {
        private readonly ApplicationDbContext _context = context;

        public Task CreateAsync(GameRoom item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public bool Exists(int id)
        {
            return _context.GameRoom.Any(gr => gr.GameRoomId == id);
        }

        public bool IsModified(GameRoom item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }

        public Task<IEnumerable<GameRoom>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<GameRoom?> GetAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(int id, GameRoom item)
        {
            throw new NotImplementedException();
        }
    }
}