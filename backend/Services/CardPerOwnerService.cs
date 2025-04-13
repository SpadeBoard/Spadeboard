using Data;
using Microsoft.EntityFrameworkCore;
using Models.Bridge;
using Models.Cards;

namespace Services
{
    public class CardPerOwnerService(ApplicationDbContext context, ICardService cardService) : ICardPerOwnerService
    {
        private readonly ApplicationDbContext _context = context;

        private readonly ICardService _cardService = cardService;

        // TODO: Modify the cards controller to use this
        public async Task<IEnumerable<Card>> GetCardsPerOwnerAsync(string ownerId)
        {
            var cardsPerOwner = await _context.CardPerOwner
                .Where(cpo => cpo.OwnerId == ownerId)
                .ToListAsync();

            List<Card> cards = [];

            if (cardsPerOwner != null)
            {
                foreach (CardPerOwner cpo in cardsPerOwner)
                {
                    var card = await _cardService.GetCardAsync(cpo.CardId);

                    if (card != null) 
                    {
                        cards.Add(card);
                    }
                }
            }

            return cards;
        }

        public async Task<CardPerOwner?> GetCardPerOwnerByCardIdAsync(int cardId)
        {
            return await _context.CardPerOwner
                .FirstOrDefaultAsync(cpo => cpo.CardId == cardId);
        }

        public async Task<CardPerOwner> CreateCardPerOwnerAsync(CardPerOwner cpo)
        {
            await _context.CardPerOwner.AddAsync(cpo);
            await _context.SaveChangesAsync();

            return cpo;
        }

        /*public async Task<CardPerOwner> UpdateCardPerOwnerAsync(int cardId, string ownerId)
        {
            await _context.CardPerOwner.AddAsync(cpo);
            await _context.SaveChangesAsync();

            return cpo;
        }*/
    }
}