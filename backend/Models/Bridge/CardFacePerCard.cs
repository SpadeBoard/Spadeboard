using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Cards;
using Services;

/*
There should be a bridge table comprising of Card ID, Dnd Position ID, Game Room ID. It's because the posiitioning of a card is going to be different per game room. 

https://stackoverflow.com/questions/14149110/how-to-represent-bridge-table-in-entity-framework-code-first
https://www.codeproject.com/Articles/234606/Creating-a-Many-To-Many-Mapping-Using-Code-First
Bridge tables documentation
*/
namespace Models.Bridge
{
    // TODO: In the frontend, update the CardApiService to use this table to get back all of the card faces
    [Table("CardFacePerCard")]
    public class CardFacePerCard: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CardFacePerCardId { get; set; }

        [NotMapped]
        public long Id { get => CardFacePerCardId; set => CardFacePerCardId = value; }

        [Required]
        public long CardId { get; set; }
        [ForeignKey("CardId")]
        public virtual Card? Card { get; set; }

        [Required]
        public long CardFaceId {get; set;}
        [ForeignKey("CardFaceId")]
        public virtual CardFace? CardFace {get; set;}
    }

    public class CardFacePerCardDto
    {
        public string CardFacePerCardId { get; set; }

        public string CardId { get; set; }
        public virtual Card? Card { get; set; }

        public string CardFaceId {get; set;}
        public virtual CardFace? CardFace {get; set;}
    }
}