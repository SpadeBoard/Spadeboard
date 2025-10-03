using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Cards;
using Models.Files;
using Services;

namespace Models.Bridge
{
    [Table("CardFacesPerLod")]
    public class CardFacePerLod: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CardFacePerLodId { get; set; }

        [NotMapped]
        public long Id { get => CardFacePerLodId; set => CardFacePerLodId = value; }
        
        public long CardFaceId { get; set; }
        [ForeignKey("CardFaceId")]
        public virtual CardFace? CardFace { get; set; }

        // TODO: Maybe have the levels of detail be set via the admin
        [Range(typeof(int), "0", "4") ]
        public int Lod { get; set; } // TODO: Get rid of the LOD object

        // TODO: Replace with FileMetadataID instead
        public long FileMetadataId { get; set; }
        [ForeignKey("FileMetadataId")]
        public virtual FileMetadata? FileMetadata { get; set; }
    }

    public class CardFacePerLodDto
    {
        public string CardFacePerLodId { get; set; } = "0";

        public string CardFaceId { get; set; } = "0";
        public virtual CardFaceDto? CardFace { get; set; }

        public int Lod;

        public string FileMetadataId { get; set; }
        public virtual FileMetadataDto? FileMetadata { get; set; }
    }
}
