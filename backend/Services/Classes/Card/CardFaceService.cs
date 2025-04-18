using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using System.Net.Sockets;

namespace Services
{
    public class CardFaceService(ApplicationDbContext context) : ICardFaceService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task CreateNavAsync(CardFace cardFace){
            if (cardFace.Style != null) {
                cardFace.Style.StyleId = 0;
                _context.Style.Add(cardFace.Style);
                cardFace.StyleId = cardFace.Style.StyleId;
            }

            cardFace.CardFaceId = 0;
            _context.CardFace.Add(cardFace);
            await _context.SaveChangesAsync();
        }
        
        public async Task<bool> DeleteNavAsync(CardFace cardFace)
        {
            _context.CardFace.Remove(cardFace);

            if (cardFace.Style != null)
            {
                _context.Style.Remove(cardFace.Style);
            }

            int changes = await _context.SaveChangesAsync();
            return changes > 0;
        }

        public async Task UpdateNavAsync(CardFace cardFace)
        {
            if (cardFace.Style != null)
            {
                _context.Entry(cardFace.Style).State = EntityState.Modified;
            }

            _context.Entry(cardFace).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(cardFace.CardFaceId))
                {
                    throw;
                }
                else
                {
                    throw;
                }
            }
        }

        public bool Exists(int id)
        {
            return _context.CardFace.Any(e => e.CardFaceId == id);
        }

        // FIXME: Card face doesn't have a Card ID
        public async Task<CardFace?> GetNavAsync(int cardFaceId)
        {
            var cardFace = await _context.CardFace
                .Include(cardFace => cardFace.Style)
                .FirstOrDefaultAsync(cardFace => cardFace.CardFaceId == cardFaceId);

            if (cardFace == null)
            {
                return null;
            }

            return cardFace;
        }

        public async Task<IEnumerable<CardFace>> GetAllAsync()
        {
            return await _context.CardFace.ToListAsync();
        }

        public async Task<CardFace?> GetAsync(int id)
        {
            return await _context.CardFace.FindAsync(id);
        }

        public async Task CreateAsync(CardFace item)
        {
            _context.CardFace.Add(item);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateAsync(int id, CardFace item)
        {
            if (id != item.CardFaceId)
                return false;

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

        public async Task<bool> DeleteAsync(int id)
        {
            var cardFace= await GetAsync(id);
            if (cardFace== null)
            {
                return false;
            }

            _context.CardFace.Remove(cardFace);
            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public async Task<IEnumerable<CardFace>> GetAllNavAsync()
        {
            var cardFaces = await _context.CardFace
            .Include(cf => cf.Style)
            .ToListAsync();

            return cardFaces;
        }
    }
}