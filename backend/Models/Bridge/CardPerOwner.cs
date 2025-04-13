using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Models.Cards;

namespace Models.Bridge
{
    [Table("CardPerOwner")]
    [PrimaryKey(nameof(CardId), nameof(OwnerId))]
    public class CardPerOwner
    {
        [ForeignKey("CardId")]
        public int CardId { get; set; }
        public Card Card { get; set; }

        public string OwnerId {get; set;}
        [ForeignKey("OwnerId")]
        public virtual IdentityUser Owner {get; set;}
    }
}