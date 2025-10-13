using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Services;

namespace Models.Files
{
    public enum FileMetadataStatus
    {
        Pending,
        Attached,
        Orphaned
    }

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

        public FileMetadataStatus FileMetadataStatus {get; set;} = FileMetadataStatus.Pending;
        public DateTime? CreationDate { get; set; }
    }

    public class FileMetadataDto 
    {
        public string FileMetadataId { get; set; }
        public string VolumePath { get; set; }
        public string FileName { get; set; }
        public FileMetadataStatus FileMetadataStatus {get; set;} = FileMetadataStatus.Pending;
        public DateTime?CreationDate { get; set; }
    }
}