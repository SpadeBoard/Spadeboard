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
    public class CardFaceService(ApplicationDbContext context) : ICardFaceService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task DeleteCardFaceDtoAsync(CardFace cardFace)
        {
            _context.CardFace.Remove(cardFace);
            await _context.SaveChangesAsync();

            if (cardFace.Style != null)
            {
                _context.Style.Remove(cardFace.Style);
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateCardFaceDtoAsync(CardFace cardFace)
        {
            _context.Entry(cardFace).State = EntityState.Modified;

            if (cardFace.Style != null) 
                _context.Entry(cardFace.Style).State = EntityState.Modified;

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
        public async Task<CardFace> GetCardFaceDtoAsync(int cardFaceId)
        {
            try
            {
                var cardFace = await _context.CardFace.FirstOrDefaultAsync(cardFace => cardFace.CardFaceId == cardFaceId);
                
                if (cardFace == null) {
                    throw new Exception("Can't get card face");
                }

                var style = await _context.Style.FirstOrDefaultAsync(style => style.StyleId == cardFace.StyleId);

                if (style != null)
                {
                    cardFace.Style = style;
                }

                return cardFace;
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}