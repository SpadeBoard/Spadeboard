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
using Newtonsoft.Json;
using Models.Bridge;

namespace Services
{
    public class CardFacePerCardService(ApplicationDbContext context) : ICardFacePerCardService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task<CardFacePerCard> CreateAsync(CardFacePerCard item)
        {
            item.CardFacePerCardId = 0;
            await _context.CardFacePerCard.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public Task<CardFacePerCard> CreateNavAsync(CardFacePerCard nav)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteAsync(long id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteNavAsync(long nav)
        {
            throw new NotImplementedException();
        }

        public bool Exists(long id)
        {
            return _context.CardFacePerCard.Any(c => c.CardFacePerCardId == id);
        }

        public Task<IEnumerable<CardFacePerCard>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<CardFacePerCard>> GetAllNavAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<CardFace>> GetAllFacesByCardId(long cardId)
        {
            return await _context.CardFacePerCard
                .Where(c => c.CardId == cardId)
                .Include(c => c.CardFace)
                .Select(c => c.CardFace)
                .Where(face => face != null)
                .Select(face => face!)
                .ToListAsync();
        }

        public async Task<IEnumerable<CardFacePerCard>> GetAllByCardId(long cardId)
        {
            return await _context.CardFacePerCard
                .Where(c => c.CardId == cardId)
                .ToListAsync();
        }

        public Task<CardFacePerCard?> GetAsync(long id)
        {
            throw new NotImplementedException();
        }

        public Task<CardFacePerCard?> GetNavAsync(long id)
        {
            throw new NotImplementedException();
        }

        public bool IsModified(CardFacePerCard item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(long id, CardFacePerCard item)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateNavAsync(CardFacePerCard nav)
        {
            throw new NotImplementedException();
        }
    }
}
