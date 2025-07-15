using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;

namespace Services
{
    public class CardPerOwnerService(ApplicationDbContext context) : ICardPerOwnerService
    {
        private readonly ApplicationDbContext _context = context;

        private readonly CrudService<CardPerOwner> _crudService = new(context, cpo => cpo.CardPerOwnerId);
        
        // TODO: Modify the cards controller to use this
        public async Task<IEnumerable<Card>> GetCardsByOwnerIdAsync(string ownerId)
        {
            var cards = await _context.CardPerOwner
                .Where(cpo => cpo.OwnerId == ownerId)
                .Include(cpo => cpo.Card)
                .Select(cpo => cpo.Card)
                .OfType<Card>()
                .ToListAsync(); 

            return cards;
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

        public async Task<CardPerOwner> CreateAsync(CardPerOwner item)
        {
            return await _crudService.CreateAsync(item);
        }

        public async Task<bool> DeleteByCardIdAndOwnerIdAsync(long cardId, string ownerId)
        {
            CardPerOwner? cpo = await GetByCardIdAndOwnerIdAsync(cardId, ownerId);
        
            if (cpo == null)
            {
                return false;
            }

            return await DeleteAsync(cpo.CardPerOwnerId);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }

        public bool Exists(long id)
        {
            return _crudService.Exists(id);
        }

        public bool IsModified(CardPerOwner item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<CardPerOwner>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<CardPerOwner?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, CardPerOwner item)
        {
            return await _crudService.UpdateAsync(id, item);
        }
    }
}