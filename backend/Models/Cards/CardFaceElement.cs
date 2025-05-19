using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.DndItems;
using Models.Files;
using Models.Styles;
using Services;
using System.Text.Json.Serialization;

namespace Models.Cards
{
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "cardFaceElementType")]
    [JsonDerivedType(typeof(CardFaceElementRtDto), "Rte")]
    [JsonDerivedType(typeof(CardFaceElementImageDto), "Image")]
    public class CardFaceElementDto
    {
       public string CardFaceElementId { get; set; } = "0";

        public string? StyleId {get; set;} = "0";
        public virtual StyleDto? Style {get; set;}
    }

    public class CardFaceElementRtDto : CardFaceElementDto
    {
        public string? CardFaceElementContent { get; set; }
    }

    public class CardFaceElementImageDto : CardFaceElementDto
    {
        public string? ImageFileMetadataId { get; set; }
        public FileMetadataDto? ImageFileMetadata { get; set; }
    }

    [JsonPolymorphic(TypeDiscriminatorPropertyName = "cardFaceElementType")]
    [JsonDerivedType(typeof(CardFaceElementRt), "Rte")]
    [JsonDerivedType(typeof(CardFaceElementImage), "Image")]
    [Table("CardFaceElements")] 
    public abstract class CardFaceElement: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CardFaceElementId { get; set; }

        [NotMapped]
        public long Id { get => CardFaceElementId; set => CardFaceElementId = value; }

        public long? StyleId {get; set;}
        [ForeignKey("StyleId")]
        public virtual Style? Style {get; set;}
    }

    [Table("CardFaceElementRts")]
    public class CardFaceElementRt : CardFaceElement
    {
       public string? CardFaceElementContent {get; set;}
    }

     [Table("CardFaceElementImages")]
    public class CardFaceElementImage : CardFaceElement
    {
        public long? ImageFileMetadataId {get; set;}
        [ForeignKey("ImageFileMetadataId")]
        public FileMetadata? ImageFileMetadata {get; set;}
    }
}