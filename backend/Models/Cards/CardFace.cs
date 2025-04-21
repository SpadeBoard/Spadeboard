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
        public int CardFaceId { get; set; }

        public int? StyleId {get; set;}
        [ForeignKey("StyleId")]
        public virtual Style? Style { get; set; }

        // 'card-thumbnail-images/[card-id]_[card-face-id]_image.jpg'
        public string? CardFaceThumbnailFilePath {get; set;}
    }

    public class CardEditorCardFaceDto 
    {
        public CardFace CardFace {get; set;}

        public CardFaceElementPerCardFace[] CardFaceElementsPerCardFace {get; set;}
    }
}
