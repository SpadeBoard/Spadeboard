using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
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
    // TODO: Rename this to CardEditorCardDto
    public class CardEditorCardDto
    {
        public Card Card { get; set; }

        public CardEditorCardFaceDto[] CardEditorCardFacesDto {get; set;}

        public string OwnerId { get;set;}
    }

    [Table("Cards")] // Maps this entity to the "Cards" table
    public class Card
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CardId { get; set; }

        public string? CardName {get;set;} = "";

        // FIXED
        // Getting the navigation properties being required
        // So make them nullable

        // TODO: Make this required, remove IsFlipped
        public int? CurrentCardFaceIndex { get; set;} = 0;
    }
}
