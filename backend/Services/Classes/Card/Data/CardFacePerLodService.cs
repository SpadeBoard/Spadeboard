using Microsoft.EntityFrameworkCore;
using Data;
using Models.Bridge;
using Models.Cards;

namespace Services
{
    public class CardFacePerLodService(ApplicationDbContext context, ICardFaceService cardFaceService, IFileMetadataService fileMetadataService) : ICardFacePerLodService
    {
        private readonly ApplicationDbContext _context = context;

        private readonly CrudService<CardFacePerLod> _crudService = new(context, c => c.CardFacePerLodId);

        private readonly ICardFaceService _cardFaceService = cardFaceService;

        private readonly IFileMetadataService _fileMetadataService = fileMetadataService;

        // ASSUMPTION: We assign the foreign keys beforehand
        public async Task<CardFacePerLod> CreateAsync(CardFacePerLod item)
        {
            // TODO: If the Card Face ID or LOD ID doesn't, then throw an exception
            // If they do, then null the navigation properties and just pass them in
            if (!_cardFaceService.Exists(item.CardFaceId))
            {
                throw new ArgumentNullException("Card Face ID doesn't exist");
            }

             if (!_fileMetadataService.Exists(item.FileMetadataId))
            {
                throw new ArgumentNullException("File metadata ID doesn't exist");
            }

            item.CardFace = null;
            item.FileMetadata = null;

            return await _crudService.CreateAsync(item);
        }

        public async Task<IEnumerable<CardFacePerLod>> CreateAllAsync(CardFacePerLod[] items, CardFace cardFace)
        {
            IEnumerable<CardFacePerLod> cardFacePerLods = Enumerable.Empty<CardFacePerLod>();
            foreach(CardFacePerLod item in items) {
                item.CardFace = cardFace;

                if (item.FileMetadata == null) throw new ArgumentNullException("No file metadata associated with card face per lod");

                if (!_fileMetadataService.Exists(item.FileMetadata.FileMetadataId)) continue;

                cardFacePerLods.Append(await CreateAsync(item));
            }

            return cardFacePerLods;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            return await _crudService.DeleteAsync(id);
        }

        public bool Exists(long id)
        {
            return _crudService.Exists(id);
        }

        public bool IsModified(CardFacePerLod item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<CardFacePerLod>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<CardFacePerLod?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, CardFacePerLod item)
        {
            return await _crudService.UpdateAsync(id, item);
        }

        /*public async Task<Lods?> GetLodsNavByCardFaceIdAsync(long cardFaceId)
        {
            return await _context.CardFacePerLod
                .Where(c => c.CardFaceId == cardFaceId)
                .Select(c => c.Lods!)
                .Include(c => c.Lod0!)
                .Include(c => c.Lod1!)
                .Include(c => c.Lod2!)
                 .Include(c => c.Lod3!)
                .Include(c => c.Lod4!)
                .FirstOrDefaultAsync();
        }

        // CHECKME: To remove? We can't actually do the Dictionary with the multiple file streams in a controller
        public async Task<Dictionary<long, List<FileStream>>> GetCardFaceImageFilesByCardIdAsync(long cardId)
        {
            Dictionary<long, List<FileStream>> cardFaceImageFiles = new Dictionary<long, List<FileStream>>();

            List<CardFace>? cardFaces = (await _cardFacePerCardService.GetAllFacesByCardId(cardId)).ToList();

            foreach (CardFace cardFace in cardFaces)
            {
                Lods? lods = await GetLodsNavByCardFaceIdAsync(cardFace.CardFaceId);

                if (lods == null)
                    break;

                List<FileMetadata> filesMetadata = (await _lodService.GetFileMetadataOfAllLodsAsync(lods)).ToList();

                List<string> fileNames = [];

                foreach (FileMetadata fileMetadata in filesMetadata)
                {
                    fileNames.Add(fileMetadata.FileName);
                }

                cardFaceImageFiles.Add(cardFace.CardFaceId, (await _fileUploadService.GetCardFaceFilesAsync(fileNames)).ToList());
            }

            return cardFaceImageFiles;
        }*/

        // TODO: Make another function that passes in MULTIPLE card face IDs
        // Then run the below function in either a loop or a Task.WhenAll

        public async Task<IEnumerable<long>> GetFileMetadataIdsByCardFace(long cardFaceId)
        {
            return await _context.CardFacePerLod
                .Where(c => c.CardFaceId == cardFaceId)
                .Select(c => c.FileMetadataId)
                .ToListAsync();
        }

        public async Task<bool> OrphanLodsByCardFaceIdAsync(long cardFaceId) 
        {
            List<long> fileMetadataIds = (await GetFileMetadataIdsByCardFace(cardFaceId)).ToList();

            foreach (long fileMetadataId in fileMetadataIds) {
                bool isOrphaned = await _fileMetadataService.MarkAsOrphanedByIdAsync(fileMetadataId);

                if (!isOrphaned) throw new Exception($"Could not set the file metadata {fileMetadataId} to be orphaned.");
            }

            return true;
        }

        public async Task<bool> AttachLodsByCardFaceIdAsync(long cardFaceId) 
        {
           List<long> fileMetadataIds = (await GetFileMetadataIdsByCardFace(cardFaceId)).ToList();

            foreach (long fileMetadataId in fileMetadataIds) {
                bool isAttached = await _fileMetadataService.MarkAsAttachedByIdAsync(fileMetadataId);

                if (!isAttached) throw new Exception($"Could not set the file metadata {fileMetadataId} to be attached.");
            }

            return true;
        }
    }
}