using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;

namespace Services
{
    public class CardService(ApplicationDbContext context) : ICardService
    {
        private readonly ApplicationDbContext _context = context;

        public bool Exists(int id)
        {
            return _context.Card.Any(e => e.CardId == id);
        }

        public async Task<IEnumerable<Card>> GetCardsByOwner(string ownerId)
        {
            // FIXME: Use ownerId
            return await _context.Card
                .Where(card => card.OwnerId == ownerId)
                .ToListAsync();
        }
    }
}