using Microsoft.EntityFrameworkCore;
using Data;
using Models.Bridge;
using Models.Cards;
using Models.Files;

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

        public async Task<IEnumerable<CardFacePerLod>> CreateAllFromFilesMetadataPerCardFaceAsync(FileMetadata[] filesMetadata, long cardFaceId)
        {
            IEnumerable<CardFacePerLod> cardFacePerLods = Enumerable.Empty<CardFacePerLod>();
            foreach(var fm in filesMetadata.Select((value, index) => new { value, index })) {
                cardFacePerLods.Append(await CreateAsync(new(){
                    CardFacePerLodId = 0,
                    FileMetadataId = fm.value.FileMetadataId,
                    Lod = fm.index,
                    CardFaceId = cardFaceId
                }));
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

        // TODO: Make another function that passes in MULTIPLE card face IDs
        // Then run the below function in either a loop or a Task.WhenAll
        public async Task<IEnumerable<long>> GetFileMetadataIdsByCardFace(long cardFaceId)
        {
            return await _context.CardFacePerLod
                .Where(c => c.CardFaceId == cardFaceId)
                .Select(c => c.FileMetadataId)
                .ToListAsync();
        }

        public async Task<IEnumerable<FileMetadata>> GetFilesMetadataByCardFace(long cardFaceId)
        {
            return await _context.CardFacePerLod
                .Where(c => c.CardFaceId == cardFaceId)
                .Select(c => c.FileMetadata)
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