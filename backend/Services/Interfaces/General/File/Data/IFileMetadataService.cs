using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Models.Files;

namespace Services
{
    public interface IFileMetadataService: ICrud<FileMetadata>
    {
        public Task<bool> UpdateAllAsync(FileMetadata[] fileMetadata);
        public Task<bool> UpdateStatusByVolumePathAndFileNameAsync(string volumePath, string fileName, FileMetadataStatus fileMetadataStatus);
        public Task<bool> MarkPendingToOrphanedAsync();
        public Task<bool> MarkAsAttachedByIdAsync(long fileMetadataId);
        public Task<bool> MarkAsOrphanedByIdAsync(long fileMetadataId);
        public Task<bool> DeleteFilesByThresholdDataAsync( DateTime thresholdDate, CancellationToken cancellationToken);
    }
}