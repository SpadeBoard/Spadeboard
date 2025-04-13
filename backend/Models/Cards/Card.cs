using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Identity;
using Models.DndItems;
using Models.Styles;

/*
Bugwise:
Frontend isn't Omitting the IDs correctly
Baclend is allowing to set the ID for the entity that's being added, which shouldn't be the case

I think the easiest solution to this is overriding the context builder: https://learn.microsoft.com/en-us/dotnet/api/microsoft.entityframeworkcore.metadata.builders.propertybuilder-1.valuegeneratedonadd?view=efcore-9.0
https://www.learnentityframeworkcore.com/configuration/fluent-api/valuegeneratedonaddorupdate-method
*/
namespace Models.Cards
{
    public class CardDto
    {
        public Card Card { get; set; }
        public CardFace FrontCardFace { get; set; }
        // public CardFaceElement[]? FrontCardFaceElements {get; set;}

        public CardFaceElementDto[]? FrontCardFaceElementsDto {get; set;}

        public CardFace BackCardFace { get; set; }
        // public CardFaceElement[]? BackCardFaceElements {get; set;}
        
        public CardFaceElementDto[]? BackCardFaceElementsDto {get; set;}
        
        // public Style[]? BackCardFaceElementStyles {get;set;}
        
        public DndItem? DndItem { get; set; } // TEMP

        public string OwnerId { get;set;}
    }

    public class CardBatchCreateDto 
    {
        public CardCreateDto Card {get;set; }

        public CardFaceCreateDto FrontCardFace { get; set; }
        public StyleCreateDto FrontCardFaceStyle { get; set; } // TEMP
        public CardFaceElement[]? FrontCardFaceElements {get; set;}

        public CardFaceCreateDto BackCardFace { get; set; }
        public StyleCreateDto BackCardFaceStyle { get; set; } // TEMP
        public CardFaceElement[]? BackCardFaceElements {get; set;}
        
        public DndItemCreateDto? DndItem { get; set; } // TEMP
    }

    public class CardCreateDto
    {
        [Required]
        public int FrontCardFaceId { get; set; }

        [Required]
        public int BackCardFaceId { get; set; }

        [Required]
        public bool IsFlipped { get; set; }
    }

    [Table("Cards")] // Maps this entity to the "Cards" table
    public class Card
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CardId { get; set; }

        // FIXED
        // Getting the navigation properties being required
        // So make them nullable

        // TODO: Specify it's a foreign key
        // FIXME: Allow nulls for now?
        // At least the front card face should be required?
        [Required]
        public int FrontCardFaceId { get; set; }
        [ForeignKey("FrontCardFaceId")]
        public virtual CardFace? FrontCardFace { get; set; }

        [Required]
        public int BackCardFaceId { get; set; }
        [ForeignKey("BackCardFaceId")]
        public virtual CardFace? BackCardFace { get; set; }

        // TODO: Specify it's a foreign key
        // FIXME: Do we need a foreign key to this, or should it be made dynamically in frontend
       /* [Required] // Makes this property mandatory
        public int DndItemId {get; set;}
        [ForeignKey("DndItemId")]
        public virtual DndItem? DndItem { get; set; }*/

        [Required]
        public bool IsFlipped {get;set;}

        // Owner ID
        /*public string? OwnerId {get; set;}
        [ForeignKey("OwnerId")]
        public virtual IdentityUser? Owner {get; set;}*/
    }
}
