using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Bridge;
using Models.Styles;

namespace Models.Cards
{
    [Table("CardFaces")] // Maps this entity to the "Cards" table
    public class CardFace
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CardFaceId { get; set; }

        public long? StyleId {get; set;}
        [ForeignKey("StyleId")]
        public virtual Style? Style { get; set; }

        // 'card-thumbnail-images/[card-id]_[card-face-id]_image.jpg'
        public string? CardFaceThumbnailFilePath {get; set;}
    }

    public class CardFaceDto
    {
        public string CardFaceId { get; set; } = "0";

        public string? StyleId {get; set;} = "0";
        public virtual StyleDto? Style { get; set; }

        // 'card-thumbnail-images/[card-id]_[card-face-id]_image.jpg'
        public string? CardFaceThumbnailFilePath {get; set;}
    }

    public class CardEditorCardFaceDto 
    {
        public CardFaceDto CardFace {get; set;}

        public CardFaceElementPerCardFaceDto[] CardFaceElementsPerCardFace {get; set;}
    }
}
