using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;

namespace Services
{
    public class CardPerOwnerService(ApplicationDbContext context) : ICardPerOwnerService
    {
        private readonly ApplicationDbContext _context = context;

        // TODO: Modify the cards controller to use this
        public async Task<IEnumerable<Card>> GetCardsByOwnerIdAsync(string ownerId)
        {
            return await _context.CardPerOwner
                .Where(cpo => cpo.OwnerId == ownerId)
                .Include(cpo => cpo.Card)
                .Select(cpo => cpo.Card)
                .Where(card => card != null)
                .Select(card => card!)
                .ToListAsync();
        }

        // TODO: Probably fix this considering you can have multiple cards with multiple owners, might actually need a surrogate key instead of composite
        // Or something else, maybe the game room?
        public async Task<CardPerOwner?> GetByCardIdAsync(long cardId)
        {
            return await _context.CardPerOwner
                .FirstOrDefaultAsync(cpo => cpo.CardId == cardId);
        }

        public async Task<CardPerOwner?> GetNavByCardIdAsync(long cardId)
        {
            return await _context.CardPerOwner
                .Include(cpo => cpo.Card)
                .Include(cpo => cpo.Owner)
                .FirstOrDefaultAsync(cpo => cpo.CardId == cardId);
        }

        public async Task<CardPerOwner?> GetByCardIdAndOwnerIdAsync(long cardId, string ownerId)
        {
            return await _context.CardPerOwner
                .FirstOrDefaultAsync(cpo => cpo.CardId == cardId && cpo.OwnerId == ownerId);
        }

        public async Task<CardPerOwner> CreateAsync(CardPerOwner cpo)
        {
            cpo.CardPerOwnerId = 0;
            await _context.CardPerOwner.AddAsync(cpo);
            await _context.SaveChangesAsync();
            return cpo;
        }

        public async Task<IEnumerable<CardPerOwner>> GetAllAsync()
        {
            return await _context.CardPerOwner.ToListAsync();
        }

        public Task<CardPerOwner?> GetAsync(long id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(long id, CardPerOwner item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(long id)
        {
            throw new NotImplementedException();
        }

        // TODO: Fix this, add a primary key?
        public bool Exists(long id)
        {
            return true;
        }

        public bool IsModified(CardPerOwner item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }
    }
}