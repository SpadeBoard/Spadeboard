using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.DndItems;
using Models.Styles;
using Services;

namespace Models.Cards
{
    // TODO: Use the DTO instead of CardFaceElement for the CardEditorCardDto as well as the services
    public class CardFaceElementDto
    {
       public string CardFaceElementId { get; set; } = "0";
       
        public string? CardFaceElementContent {get; set;}

        public string? CardFaceElementType {get; set;}

        public string? StyleId {get; set;} = "0";
        public virtual StyleDto? Style {get; set;}
    }

    [Table("CardFaceElements")] // Maps this entity to the "Cards" table
    public class CardFaceElement: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CardFaceElementId { get; set; }

        [NotMapped]
        public long Id { get => CardFaceElementId; set => CardFaceElementId = value; }

        public string? CardFaceElementContent {get; set;}

        public string? CardFaceElementType {get; set;}

        public long? StyleId {get; set;}
        [ForeignKey("StyleId")]
        public virtual Style? Style {get; set;}
    }
}