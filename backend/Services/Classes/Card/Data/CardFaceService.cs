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
using Algorithms;

namespace Services
{
    public class CardFaceService(ApplicationDbContext context, IStyleService styleService) : ICardFaceService
    {
        private readonly ApplicationDbContext _context = context;

        private readonly IStyleService _styleService = styleService;


        public async Task<bool> DeleteNavAsync(long id)
        {
            var nav = await GetNavAsync(id);

            if (nav == null)
            {
                return false;
            }
            
            _context.CardFace.Remove(nav);

            if (nav.Style != null)
            {
                _context.Style.Remove(nav.Style);
            }

            long changes = await _context.SaveChangesAsync();
            return changes > 0;
        }

        public async Task<bool> UpdateNavAsync(CardFace nav)
        {
            if (nav.Style != null && _styleService.IsModified(nav.Style))
            {
                _context.Entry(nav.Style).State = EntityState.Modified;
            }

            _context.Entry(nav).State = EntityState.Modified;

            try
            {
                return await _context.SaveChangesAsync() > 0;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(nav.CardFaceId))
                {
                    return false;
                }
                else
                {
                    throw;
                }
            }
        }


        public bool Exists(long id)
        {
            return _context.CardFace.Any(e => e.CardFaceId == id);
        }

        // FIXME: Card face doesn't have a Card ID
        public async Task<CardFace?> GetNavAsync(long cardFaceId)
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

        public async Task<CardFace?> GetAsync(long id)
        {
            return await _context.CardFace.FindAsync(id);
        }

        public async Task<CardFace> CreateAsync(CardFace item)
        {
            item.CardFaceId = 0;
            await _context.CardFace.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> UpdateAsync(long id, CardFace item)
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

        public async Task<bool> DeleteAsync(long id)
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

        public bool IsModified(CardFace item)
        {
            return _context.Entry(item).Properties.Any(p => p.IsModified);
        }

        public async Task<CardFace> CreateNavAsync(CardFace nav)
        {
             if (nav.Style == null)
            {
                throw new ArgumentException("Item: Card Face\nFunction: Create Nav Async\nThe Style property of CardFace cannot be null.", nameof(nav));
            }

            if (_styleService.Exists(nav.Style.StyleId))
            {
                throw new ArgumentException("Item: Card Face\nFunction: Create Nav Async\nThe Style property of CardFacehas already been made.", nameof(nav));
            }

            nav.Style.StyleId = Snowflake.NewId();
            nav.CardFaceId = Snowflake.NewId();
            
            await _context.CardFace.AddAsync(nav);

            int changes = await _context.SaveChangesAsync();

            if (changes <= 0)
                throw new Exception("No changes were made");

            await _context.Entry(nav).Reference(n => n.Style).LoadAsync();
            return nav; 
        }
    }
}