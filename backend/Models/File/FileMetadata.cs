using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Identity;
using Services;

namespace Models.Files
{
    [Table("FileMetadata")]
    public class FileMetadata: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long FileMetadataId { get; set; }
        [NotMapped]
        public long Id { get => FileMetadataId; set => FileMetadataId = value; }
        public string VolumePath { get; set; }
        public string FileName { get; set; }
        public DateTime? LastUsedAt { get; set; } // NULL means currently in use
    }

    public class FileMetadataDto 
    {
        public string FileMetadataId { get; set; }
        public string VolumePath { get; set; }
        public string FileName { get; set; }
        public DateTime? LastUsedAt { get; set; } // NULL means currently in use
    }
}