using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Bridge;
using Models.Files;
using Models.Styles;
using Services;

namespace Models.Cards
{
    [Table("CardFaces")] // Maps this entity to the "Cards" table
    public class CardFace: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CardFaceId { get; set; }

        [NotMapped]
        public long Id { get => CardFaceId; set => CardFaceId = value; }
        
        public long? StyleId {get; set;}
        [ForeignKey("StyleId")]
        public virtual Style? Style { get; set; }

        public long? CardFaceThumbnailFileMetadataId {get; set;}
        [ForeignKey("CardFaceThumbnailFileMetadataId")]
        public virtual FileMetadata? CardFaceThumbnailFileMetadata {get;set;}
    }

    public class CardFaceDto
    {
        public string CardFaceId { get; set; } = "0";
        public string? StyleId {get; set;} = "0";
        public virtual StyleDto? Style { get; set; }

        public string? CardFaceThumbnailFileMetadataId {get; set;}
        public virtual FileMetadataDto? CardFaceThumbnailFileMetadata {get;set;}
    }

    public class CardEditorCardFaceDto 
    {
        public CardFaceDto CardFace {get; set;}

        public FileMetadataDto[] FileMetadataLods { get; set; }

        public CardFaceElementPerCardFaceDto[] CardFaceElementsPerCardFace {get; set;}
    }
}
