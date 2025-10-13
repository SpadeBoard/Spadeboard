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

        private readonly CrudService<CardFacePerCard> _crudService = new(context, fpc => fpc.CardFacePerCardId);

        public async Task<CardFacePerCard> CreateAsync(CardFacePerCard item)
        {
            return await _crudService.CreateAsync(item);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }

        public bool Exists(long id)
        {
            return _crudService.Exists(id);
        }

        public bool IsModified(CardFacePerCard item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<CardFacePerCard>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<CardFacePerCard?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, CardFacePerCard item)
        {
            return await _crudService.UpdateAsync(id, item);
        }

        public async Task<CardFacePerCard> CreateNavAsync(CardFacePerCard nav)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteNavAsync(long nav)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<CardFacePerCard>> GetAllNavAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<CardFace>> GetAllFacesByCardId(long cardId)
        {
            return await _context.CardFacePerCard
                .Where(c => c.CardId == cardId)
                .Include(c => c.CardFace)
                    .ThenInclude(cf => cf.Style)
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

        public async Task<CardFacePerCard?> GetNavAsync(long id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UpdateNavAsync(CardFacePerCard nav)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteByCardAndCardFaceAsync(long cardId, long cardFaceId)
        {
            List<CardFacePerCard>? cardFacesPerCard= await _context.CardFacePerCard
            .Where(c => c.CardId == cardId && c.CardFaceId == cardFaceId).ToListAsync();

            if (cardFacesPerCard.Count > 0)
            {
                _context.CardFacePerCard.RemoveRange(cardFacesPerCard);
                return await _context.SaveChangesAsync() > 0;
            }

            return false;
        }
    }
}
