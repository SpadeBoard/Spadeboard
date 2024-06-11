using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Styles;

namespace Models.Cards
{
    [Table("CardFaceElements")] // Maps this entity to the "Cards" table
    public class CardFaceElement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CardFaceElementId { get; set; }

        public int CardFaceId {get; set;}
        [ForeignKey("CardFaceId")]
        public virtual CardFace? CardFace { get; set; }

        public string? CardFaceElementContent {get; set;}

        public string? CardFaceElementType {get; set;}

        public int? StyleId {get; set;}
        [ForeignKey("StyleId")]
        public virtual Style? Style {get; set;}
    }
}