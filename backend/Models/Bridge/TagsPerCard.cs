using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Cards;
using Models.Tags;
using Services;

namespace Models.Bridge
{
    [Table("TagsPerCard")]
    public class TagsPerCard: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long TagsPerCardId {get; set;}

        [NotMapped]
        public long Id { get => TagsPerCardId; set => TagsPerCardId = value; }

        public long TagId {get; set;}
        [ForeignKey("TagId")]
        public virtual Tag? Tag {get; set;}

        public long CardId {get; set;}
        [ForeignKey("CardId")]
        public virtual Card?Card {get; set;}
    }

    public class TagsPerCardDto
    {
        public string TagsPerCardId { get; set; }

        public string TagId { get; set; }

        public string CardId { get; set; }
    }
}