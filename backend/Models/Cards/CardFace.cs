using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Styles;

namespace Models.Cards
{
    public class CardFaceCreateDto
    {
        public int StyleId {get; set;}
    }

    [Table("CardFaces")] // Maps this entity to the "Cards" table
    public class CardFace
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CardFaceId { get; set; }

        public int? StyleId {get; set;}
        [ForeignKey("StyleId")]
        public virtual Style? Style { get; set; }
    }
}
