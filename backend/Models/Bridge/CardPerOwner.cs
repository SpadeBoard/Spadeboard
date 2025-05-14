using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Models.Cards;
using Services;

namespace Models.Bridge
{
    [Table("CardPerOwner")]
    public class CardPerOwner: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long CardPerOwnerId {get; set;}

        [NotMapped]
        public long Id { get => CardPerOwnerId; set => CardPerOwnerId = value; }

        public long CardId { get; set; }
        [ForeignKey("CardId")]
        public Card? Card { get; set; }

        public string OwnerId {get; set;}
        [ForeignKey("OwnerId")]
        public virtual IdentityUser? Owner {get; set;}
    }

    public class CardPerOwnerDto
    {
        public string CardPerOwnerId {get; set;} = "0";
        public string CardId { get; set; } = "0";

        public string OwnerId {get; set;} = "0";
    }
}