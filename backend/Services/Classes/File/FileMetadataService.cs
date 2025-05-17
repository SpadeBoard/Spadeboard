using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Services;
using Data;
using Models.Files;
using Microsoft.EntityFrameworkCore;

namespace Services
{
    public class FileMetadataService(ApplicationDbContext context, IFileUploadService fileUploadService): IFileMetadataService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IFileUploadService _fileUploadService = fileUploadService;
        private readonly CrudService<FileMetadata> _crudService = new(context, fileMetadata => fileMetadata.FileMetadataId);

        public async Task<FileMetadata> CreateAsync(FileMetadata item)
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

        public bool IsModified(FileMetadata item)
        {
            return _crudService.IsModified(item);
        }

        public async Task<IEnumerable<FileMetadata>> GetAllAsync()
        {
            return await _crudService.GetAllAsync();
        }

        public async Task<FileMetadata?> GetAsync(long id)
        {
            return await _crudService.GetAsync(id);
        }

        public async Task<bool> UpdateAsync(long id, FileMetadata item)
        {
            return await _crudService.UpdateAsync(id, item);
        }

        public async Task<bool> UpdateLastUsedAtByVolumePathAndFileNameAsync(string volumePath, string fileName, DateTime? lastUsedAt)
        {
            FileMetadata? fileMetadata = await _context.FileMetadata.FirstOrDefaultAsync(f => f.VolumePath == volumePath && f.FileName == fileName);
        
            if (fileMetadata == null) {
                return false;
            }

            fileMetadata.LastUsedAt = lastUsedAt;
            int changes = await _context.SaveChangesAsync();
            return changes > 0;
        }

         public async Task<bool> DeleteFilesByThresholdDataAsync( DateTime thresholdDate, CancellationToken cancellationToken)
         {
            List<FileMetadata> oldFilesMetadata = await _context.FileMetadata
                        .Where(f => f.LastUsedAt != null && f.LastUsedAt < thresholdDate)
                        .ToListAsync(cancellationToken);

            foreach (FileMetadata fileMetadata in oldFilesMetadata)
            {
                // CHECKME: Should we have it be two separate processes, delete the file vs deleting model separately?
                await _fileUploadService.DeleteFileAsync(fileMetadata.VolumePath, fileMetadata.FileName);
                _context.FileMetadata.Remove(fileMetadata);    
            }

            int changes = await _context.SaveChangesAsync(cancellationToken);
            return changes > 0;
         }
    }
}