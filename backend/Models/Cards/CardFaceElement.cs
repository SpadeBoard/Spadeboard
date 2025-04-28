using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.DndItems;
using Models.Styles;

namespace Models.Cards
{
    // TODO: Use the DTO instead of CardFaceElement for the CardEditorCardDto as well as the services
    public class CardFaceElementDto
    {
        public CardFaceElement CardFaceElement {get; set;}

        public DndItemDto DndItemDto {get; set;}
    
        public int? StyleId {get; set;}
        [ForeignKey("StyleId")]
        public virtual Style? Style {get; set;}
    }

    /*[Table("CardFaceElementTemplates")]
    public class CardFaceElementTemplates
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CardFaceElementTemplateId { get; set; }

        public int? CardFaceElementId {get; set;}
        [ForeignKey("CardFaceElementId")]
        public CardFaceElement? CardFaceElement {get; set;}

        public int? StyleId {get; set;}
        [ForeignKey("StyleId")]
        public virtual Style? Style {get; set;}
    }*/

    [Table("CardFaceElements")] // Maps this entity to the "Cards" table
    public class CardFaceElement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CardFaceElementId { get; set; }

        public int? CardFaceId {get; set;}
        [ForeignKey("CardFaceId")]
        public virtual CardFace? CardFace { get; set; }

        public string? CardFaceElementContent {get; set;}

        public string? CardFaceElementType {get; set;}

        public int? StyleId {get; set;}
        [ForeignKey("StyleId")]
        public virtual Style? Style {get; set;}
    }
}