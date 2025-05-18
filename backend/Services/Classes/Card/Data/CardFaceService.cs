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
    public class CardFaceService(ApplicationDbContext context, IStyleService styleService, IFileMetadataService fileMetadataService) : ICardFaceService
    {
        private readonly ApplicationDbContext _context = context;

        private readonly IStyleService _styleService = styleService;

        private readonly IFileMetadataService _fileMetadataService = fileMetadataService;

        private readonly CrudService<CardFace> _crudService = new(context, cardFace => cardFace.CardFaceId);

        public bool Exists(long id)
        {
            return _crudService.Exists(id);
        }

        public bool IsModified(CardFace item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<CardFace>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<CardFace?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, CardFace item)
        {
            return await _crudService.UpdateAsync(id, item);
        }

        public async Task<CardFace> CreateAsync(CardFace item)
        {
            return await _crudService.CreateAsync(item);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }


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
            if (nav.Style != null /*&& _styleService.IsModified(nav.Style)*/)
            {
                _context.Entry(nav.Style).State = EntityState.Modified;
            }

            // This should be fine, we're not necessarily updating the card face thumbnail file metadata
            if (nav.CardFaceThumbnailFileMetadata != null)
            {
                _context.Entry(nav.CardFaceThumbnailFileMetadata).State = EntityState.Modified;
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

        // FIXME: CardFace face doesn't have a CardFace ID
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

        public async Task<IEnumerable<CardFace>> GetAllNavAsync()
        {
            var cardFaces = await _context.CardFace
            .Include(cf => cf.Style)
            .ToListAsync();

            return cardFaces;
        }

        public async Task<CardFace> CreateNavAsync(CardFace nav)
        {
             if (nav.Style == null) {
                throw new ArgumentException("Item: CardFace Face\nFunction: Create Nav Async\nThe Style property of CardFace cannot be null.", nameof(nav));
            }

            // It's theoretically possible for a card face to never have a thumbnail image taken of
            if (nav.CardFaceThumbnailFileMetadata != null) {
                if (!_fileMetadataService.Exists(nav.CardFaceThumbnailFileMetadata.FileMetadataId))
                {
                    throw new ArgumentException("Item: CardFace Face\nFunction: Create Nav Async\nThe CardFaceThumbnailFileMetadataproperty of CardFace must already exist", nameof(nav));
                }

                nav.CardFaceThumbnailFileMetadataId = nav.CardFaceThumbnailFileMetadata.FileMetadataId;
                nav.CardFaceThumbnailFileMetadata = null;
            }
            // TODO: Use this when we set up the LODs
            /*if (!_cardFaceThumbnailFileMetadataService.Exists(nav.CardFaceThumbnailFileMetadata.CardFaceThumbnailFileMetadataId) {
                throw new ArgumentException("Item: CardFace Face\nFunction: Create Nav Async\nThe CardFaceThumbnailFileMetadataproperty of CardFace must already exist", nameof(nav));
            }*/

            nav.Style.StyleId = Snowflake.NewId();
            nav.CardFaceId = Snowflake.NewId();

            nav.StyleId = 0; // Makes sure to override this
            
            await _context.CardFace.AddAsync(nav);

            int changes = await _context.SaveChangesAsync();

            if (changes <= 0)
                throw new Exception("No changes were made");

            await _context.Entry(nav).Reference(n => n.Style).LoadAsync();
            await _context.Entry(nav).Reference(n => n.CardFaceThumbnailFileMetadata).LoadAsync();
            return nav; 
        }
    }
}