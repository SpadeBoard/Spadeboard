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

    public class CardPositionPerRoomDto
    {
        public string CardPositionPerRoomId { get; set; } = "0";

        public string CardId { get; set; } = "0";
        public virtual CardDto? Card { get; set; }

        public string DndItemId { get; set; } = "0";
        public virtual DndItemDto? DndItem { get; set; }

        public string DndPositionId {get; set;} = "0";
        public virtual DndPositionDto? DndPosition {get; set;}

        public string GameRoomId {get; set;} = "0";
        public virtual GameRoomDto? GameRoom {get; set;}
    }
}