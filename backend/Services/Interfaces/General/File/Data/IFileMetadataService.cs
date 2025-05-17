using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Models.Files;

namespace Services
{
    public interface IFileMetadataService: ICrud<FileMetadata>
    {
        public Task<bool> UpdateLastUsedAtByVolumePathAndFileNameAsync(string volumePath, string fileName, DateTime? lastUsedAt);

        public Task<bool> DeleteFilesByThresholdDataAsync( DateTime thresholdDate, CancellationToken cancellationToken);
    }
}