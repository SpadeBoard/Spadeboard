using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Cards;
using Models.DndItems;
using Models.GameRooms;

/*
There should be a bridge table comprising of Card ID, Dnd Position ID, Game Room ID. It's because the posiitioning of a card is going to be different per game room. 

https://stackoverflow.com/questions/14149110/how-to-represent-bridge-table-in-entity-framework-code-first
https://www.codeproject.com/Articles/234606/Creating-a-Many-To-Many-Mapping-Using-Code-First
Bridge tables documentation
*/
namespace Models.Bridge
{
    // TODO: Move this to its own namespace and file
    [Table("CardPositionPerRoom")]
    public class CardPositionPerRoom
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CardPositionPerRoomId { get; set; }

        [Required]
        public long CardId { get; set; }
        [ForeignKey("CardId")]
        public virtual Card? Card { get; set; }

        public long DndItemId { get; set; }
        [ForeignKey("DndItemId")]
        public virtual DndItem? DndItem { get; set; }

        [Required]
        public long DndPositionId {get; set;}
        [ForeignKey("DndPositionId")]
        public virtual DndPosition? DndPosition {get; set;}

        [Required]
        public long GameRoomId {get; set;}
        [ForeignKey("GameRoomId")]
        public virtual GameRoom? GameRoom {get; set;}
    }
}