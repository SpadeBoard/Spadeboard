using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using Models.Bridge;

// https://stackoverflow.com/questions/59753218/how-to-use-dbcontext-in-separate-class-library-net-core
// https://www.postgresql.org/docs/current/ddl-schemas.html#:~:text=Unlike%20databases%2C%20schemas%20are%20not,without%20interfering%20with%20each%20other.

// Main schema: bridge tables containing item, dnd position, game room id as well as bridge tables containing item ID and user ID


namespace Services
{
    public class CardService(ApplicationDbContext context) : ICardService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task CreateAsync(Card item)
        {
            await _context.Card.AddAsync(item);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var card= await GetAsync(id);
            if (card== null)
            {
                return false;
            }

            _context.Card.Remove(card);
            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public bool Exists(long id)
        {
            return _context.Card.Any(e => e.CardId == id);
        }

        public bool IsModified(Card item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }

        public async Task<IEnumerable<Card>> GetAllAsync()
        {
            return await _context.Card.ToListAsync();
        }

        public async Task<Card?> GetAsync(long id)
        {
            var card = await _context.Card.FindAsync(id);

            return card;
        }

        public async Task<bool> UpdateAsync(long id, Card item)
        {
            if (id != item.CardId)
            {
                return false;
            }

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