using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Models.Cards;
using Models.DndItems;
using Models.Styles;

/*
There should be a bridge table comprising of Card ID, Dnd Position ID, Game Room ID. It's because the posiitioning of a card is going to be different per game room. 

https://stackoverflow.com/questions/14149110/how-to-represent-bridge-table-in-entity-framework-code-first
https://www.codeproject.com/Articles/234606/Creating-a-Many-To-Many-Mapping-Using-Code-First
Bridge tables documentation
*/
namespace Models.Bridge
{
    [Table("CardFaceElementPerCardFace")]
    public class CardFaceElementPerCardFace
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CardFaceElementPerCardFaceId {get; set;}

        [ForeignKey("CardFaceElementId")]
        public int CardFaceElementId { get; set; }
        public CardFaceElement? CardFaceElement { get; set; }
        
        [ForeignKey("DndItemId")]
        public int DndItemId { get; set; }  
        public DndItem? DndItem { get; set; }

        [ForeignKey("DndPositionId")]
        public int DndPositionId { get; set; }  
        public DndPosition? DndPosition { get; set; }

        [ForeignKey("DndDragBoundaryId")]
        public int? DndDragBoundaryId {get; set;}
        public DndDragBoundary? DndDragBoundary { get; set; }

        [ForeignKey("CardFaceId")]
        public int CardFaceId { get; set; }  
        public CardFace? CardFace { get; set; }
    }
}