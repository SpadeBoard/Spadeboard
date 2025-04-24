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
        public async Task<IEnumerable<Card>> GetCardsNavByOwnerIdAsync(string ownerId)
        {
            var cardsPerOwner = await _context.CardPerOwner
                .Where(cpo => cpo.OwnerId == ownerId)
                .Include(cpo => cpo.Card)
                .ToListAsync();

            List<Card> cards = [];

            if (cardsPerOwner != null)
            {
                foreach (CardPerOwner cpo in cardsPerOwner)
                {
                    if (cpo.Card!= null) 
                    {
                        cards.Add(cpo.Card);
                    }
                }
            }

            return cards;
        }

        // TODO: Probably fix this considering you can have multiple cards with multiple owners, might actually need a surrogate key instead of composite
        // Or something else, maybe the game room?
        public async Task<CardPerOwner?> GetByCardIdAsync(int cardId)
        {
            return await _context.CardPerOwner
                .FirstOrDefaultAsync(cpo => cpo.CardId == cardId);
        }

        public async Task<CardPerOwner?> GetNavByCardIdAsync(int cardId)
        {
            return await _context.CardPerOwner
                .Include(cpo => cpo.Card)
                .Include(cpo => cpo.Owner)
                .FirstOrDefaultAsync(cpo => cpo.CardId == cardId);
        }

        public async Task<CardPerOwner?> GetByCardIdAndOwnerIdAsync(int cardId, string ownerId)
        {
            return await _context.CardPerOwner
                .FirstOrDefaultAsync(cpo => cpo.CardId == cardId && cpo.OwnerId == ownerId);
        }

        public async Task CreateAsync(CardPerOwner cpo)
        {
            await _context.CardPerOwner.AddAsync(cpo);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<CardPerOwner>> GetAllAsync()
        {
            return await _context.CardPerOwner.ToListAsync();
        }

        public Task<CardPerOwner?> GetAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(int id, CardPerOwner item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        // TODO: Fix this, add a primary key?
        public bool Exists(int id)
        {
            return true;
        }

        public bool IsModified(CardPerOwner item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }
    }
}