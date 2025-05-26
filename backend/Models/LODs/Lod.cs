using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Services;
using Models.Files;

namespace Models.LODs
{
    [Table("LODs")]
    public class Lod : ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long LodId { get; set; }

        [NotMapped]
        public long Id { get => LodId; set => LodId = value; }

        public long Lod0Id {get; set;}
        [ForeignKey("Lod0Id")]
        public virtual FileMetadata? Lod0 { get; set; }

        public long Lod1Id {get; set;}
        [ForeignKey("Lod1Id")]
        public virtual FileMetadata? Lod1 { get; set; }

        public long Lod2Id {get; set;}
        [ForeignKey("Lod2Id")]
        public virtual FileMetadata? Lod2 { get; set; }
    }

    public class LodDto
    {
        public string LodId { get; set; }

        public string Lod0Id {get; set;}
        public virtual FileMetadataDto? Lod0 { get; set; }

        public string Lod1Id {get; set;}
        public virtual FileMetadataDto? Lod1 { get; set; }

        public string Lod2Id {get; set;}
        public virtual FileMetadataDto? Lod2 { get; set; }
    }
}