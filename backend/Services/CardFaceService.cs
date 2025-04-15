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

        public async Task CreateCardFaceNavAsync(CardFace cardFace){
            if (cardFace.Style != null) {
                _context.Style.Add(cardFace.Style);
                await _context.SaveChangesAsync();
                cardFace.StyleId = cardFace.Style.StyleId;
            }

            cardFace.CardFaceId = 0;
            _context.CardFace.Add(cardFace);
            await _context.SaveChangesAsync();
        }
        
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
            if (cardFace.Style != null)
            {
                _context.Entry(cardFace.Style).State = EntityState.Modified;
                // await _context.SaveChangesAsync();
            }

            _context.Entry(cardFace).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            /*try
            {
                if (cardFace.Style != null)
                {
                    _context.Entry(cardFace.Style).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                }

                _context.Entry(cardFace).State = EntityState.Modified;
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
            }*/
        }

        public bool Exists(int id)
        {
            return _context.CardFace.Any(e => e.CardFaceId == id);
        }

        // FIXME: Card face doesn't have a Card ID
        public async Task<CardFace> GetCardFaceNavAsync(int cardFaceId)
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

        /*
        // Example Blob data (byte array)
        byte[] blobData = new byte[] { 0x25, 0x50, 0x44, 0x46 }; // Represents a PDF file header

        // Specify the output file path
        string filePath = @"D:\output.pdf";

        // Convert and save Blob data as a file
        ConvertBlobToFile(blobData, filePath);
        */
    }
}