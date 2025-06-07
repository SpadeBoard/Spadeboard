using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models.Cards;
using Algorithms;
using Models.Files;


namespace Services
{
    public class CardFaceElementService(ApplicationDbContext context, IStyleService styleService, IFileUploadService fileUploadService, IFileMetadataService fileMetadataService) : ICardFaceElementService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IStyleService _styleService = styleService;
        private readonly IFileUploadService _fileUploadService = fileUploadService;
        private readonly IFileMetadataService _fileMetadataService = fileMetadataService;

        private readonly CrudService<CardFaceElement> _crudService = new(context, cardFaceElement => cardFaceElement.CardFaceElementId);

        public async Task<CardFaceElement> CreateAsync(CardFaceElement item)
        {
            // TODO: Set the last used date if the element's type if image to null
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

        public bool IsModified(CardFaceElement item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<CardFaceElement>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<CardFaceElement?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, CardFaceElement item)
        {
            // TODO: Set the last used date if the element's type if image to null

            return await _crudService.UpdateAsync(id, item);
        }

        public async Task<bool> UpdateAllNavAsync(CardFaceElement[] cardFaceElements)
        {
            foreach (CardFaceElement cardFaceElement in cardFaceElements)
            {
                var updated = await UpdateNavAsync(cardFaceElement);

                if (!updated) {
                    return false;
                }
            }

            return true;
        }

        public async Task<bool> UpdateNavAsync(CardFaceElement cardFaceElement)
        {
            if (cardFaceElement.Style != null /*&& _styleService.IsModified(cardFaceElement.Style)*/)
                _context.Entry(cardFaceElement.Style).State = EntityState.Modified;

            // TODO: Refactor this, absolutely necessary
            if (cardFaceElement is CardFaceElementImage imageElement && imageElement.ImageFileMetadata != null)
            {
                // TODO: Split this into two
                long id = imageElement.ImageFileMetadata.FileMetadataId;

                // Speed
                if (imageElement.ImageFileMetadata.FileMetadataStatus != FileMetadataStatus.Attached)
                {
                    await _fileMetadataService.MarkAsAttachedByIdAsync(id);
                }
                
                // Ok, this has to be redundant and can be simplified somehow
                // The problem is we're just marking the file metadata as attached, we need to reassign the imageElement.FileMetadata, and then modiify it
                // Because we need to reassign the file metadata, else it's not going to override what we previously had
                FileMetadata? updatedFileMetadata = await _fileMetadataService.GetAsync(id );
                if (updatedFileMetadata != null) {
                    imageElement.ImageFileMetadata = updatedFileMetadata;
                    _context.Entry(imageElement.ImageFileMetadata).State = EntityState.Modified;
                }
            }

            _context.Entry(cardFaceElement).State = EntityState.Modified;
        
            try
            {
                return await _context.SaveChangesAsync() > 0;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!Exists(cardFaceElement.CardFaceElementId))
                {
                    throw;
                }
                else
                {
                    throw;
                }
            }
        }

        // TODO: Refactor, split this into DeleteNavAsync and nest that in here
        public async Task DeleteAllNavAsync(CardFaceElement[] cardFaceElements) 
        {
            foreach (CardFaceElement cardFaceElement in cardFaceElements)
            {
                CardFaceElement elementToDelete = cardFaceElement;
                await DeleteNavAsync(elementToDelete.CardFaceElementId);
            }
        }

        public async Task<bool> DeleteNavAsync(long id) 
        {
            var cardFaceElement= await GetNavAsync(id);
            
            if (cardFaceElement == null)
            {
                return false;
            }

            // TODO: Refactor
            if (cardFaceElement is CardFaceElementImage imageElement && imageElement.ImageFileMetadataId != null && !await _fileMetadataService.MarkAsOrphanedByIdAsync(imageElement.ImageFileMetadataId.Value))
            {
               throw new Exception("Despite card face element having an image, it's not being marked as orphaned although being deleted");
            }

            _context.CardFaceElement.Remove(cardFaceElement);

            if (cardFaceElement.Style != null)
            {
                _context.Style.Remove(cardFaceElement.Style);
            }

            int changes =  await _context.SaveChangesAsync();

            return changes > 0;
        }

        public async Task<IEnumerable<CardFaceElement>> GetAllNavAsync()
        {
            var cardFaceElements = await _context.CardFaceElement
                .Include(element => element.Style)
                .ToListAsync();

            return cardFaceElements;
        }

        // TODO: Make a DTO matching function, use the controller and cast it
        public async Task<CardFaceElement?> GetImageNavAsync(long id)
        {
            CardFaceElementImage? cardFaceElementImage = await _context.CardFaceElement
                .OfType<CardFaceElementImage>()
                .Include(cardFaceElement => cardFaceElement.Style)
                .Include(cardFaceElement => cardFaceElement.ImageFileMetadata)
                .FirstOrDefaultAsync(cardFaceElement => cardFaceElement.CardFaceElementId == id);

            return cardFaceElementImage;
        }

        public async Task<CardFaceElement?> GetNavAsync(long id)
        {
            var cardFaceElement = await _context.CardFaceElement
                .Include(cardFaceElement => cardFaceElement.Style)
                .FirstOrDefaultAsync(cardFaceElement => cardFaceElement.CardFaceElementId == id);
            
            return cardFaceElement;
        }

        public async Task<CardFaceElement> CreateNavAsync(CardFaceElement nav)
        {
            if (nav.Style == null)
            {
                throw new ArgumentException("Item: CardFaceElement Face Element\nFunction: Create Nav Async\nThe Style property of CardFaceElement cannot be null.", nameof(nav));
            }

            // It's theoretically possible for a card face to never have a thumbnail image taken of
            // TODO: Please refactor this
            if (nav is CardFaceElementImage imageElement && imageElement.ImageFileMetadata != null)
            {
                long fileMetadataId = imageElement.ImageFileMetadata.FileMetadataId;

                if (!_fileMetadataService.Exists(fileMetadataId))
                {
                    throw new ArgumentException(
                        "Item: CardFace Face\nFunction: Create Nav Async\nThe CardFaceThumbnailFileMetadata property of CardFace must already exist",
                        nameof(nav));
                }

                if (!await _fileMetadataService.MarkAsAttachedByIdAsync(fileMetadataId))
                {
                    throw new Exception("Card face element image wasn't attached despite creating a card face element");
                }

                imageElement.ImageFileMetadataId = fileMetadataId;
                imageElement.ImageFileMetadata = null;
            }

            nav.Style.StyleId = Snowflake.NewId();
            nav.CardFaceElementId = Snowflake.NewId();

            nav.StyleId = 0; // Makes sure to override this

            // TODO: Set the last used date if the element's type if image to null
            
            await _context.CardFaceElement.AddAsync(nav);
            int changes = await _context.SaveChangesAsync();

            if (changes <= 0)
                throw new Exception("No changes were made");

            await _context.Entry(nav).Reference(e => e.Style).LoadAsync();

            // TODO: Please refactor this
            if (nav is CardFaceElementImage image)
            {
                await _context.Entry(image).Reference(e => e.ImageFileMetadata).LoadAsync();
            }

            return nav;
        }
    }
}