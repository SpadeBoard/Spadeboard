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
            _context.Card.Add(item);
            await _context.SaveChangesAsync();
        }

        public Task CreateNavAsync(Card nav)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteAsync(int id)
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

        public Task<bool> DeleteNavAsync(Card nav)
        {
            throw new NotImplementedException();
        }

        public bool Exists(int id)
        {
            return _context.Card.Any(e => e.CardId == id);
        }

        public async Task<IEnumerable<Card>> GetAllAsync()
        {
            return await _context.Card.ToListAsync();
        }

        public async Task<IEnumerable<Card>> GetAllNavAsync()
        {
            return await _context.Card
                .Include(card => card.FrontCardFace)
                .Include(card => card.BackCardFace)
                .ToListAsync();
        }

        public async Task<Card?> GetAsync(int id)
        {
            var card = await _context.Card.FindAsync(id);

            return card;
        }

        public async Task<Card?> GetNavAsync(int id)
        {
            Card? card = await _context.Card
                .Include(c => c.FrontCardFace)
                .Include(c => c.BackCardFace)
                .FirstOrDefaultAsync(c => c.CardId == id);

            return card;
        }

        public async Task<bool> UpdateAsync(int id, Card item)
        {
            if (id != item.CardId)
            {
                return false;
            }

            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return true;
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

        public Task UpdateNavAsync(Card nav)
        {
            throw new NotImplementedException();
        }
    }
}