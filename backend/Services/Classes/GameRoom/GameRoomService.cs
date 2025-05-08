using Data;
using Models.GameRooms;
using Microsoft.EntityFrameworkCore;

namespace Services
{
    public class GameRoomService(ApplicationDbContext context) : IGameRoomService
    {
        private readonly ApplicationDbContext _context = context;

        public Task CreateAsync(GameRoom item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(long id)
        {
            throw new NotImplementedException();
        }

        public bool Exists(long id)
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

        public Task<GameRoom?> GetAsync(long id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateAsync(long id, GameRoom item)
        {
            if (id != item.GameRoomId)
                return false;

            try
            {
                _context.Entry(item).State = EntityState.Modified;

                return await _context.SaveChangesAsync() > 0;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(id))
                {
                    return false;
                }
                else
                {
                    throw;
                }
            }
        }
    }
}