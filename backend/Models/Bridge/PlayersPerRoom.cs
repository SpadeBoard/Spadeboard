using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Services;
using Models.GameRooms;

namespace Models.Bridge
{
    [Table("PlayersPerRoom")]
    public class PlayersPerRoom: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long PlayersPerRoomId {get; set;}

        [NotMapped]
        public long Id { get => PlayersPerRoomId; set => PlayersPerRoomId = value; }

        public string PlayerId {get; set;}
        [ForeignKey("PlayerId")]
        public virtual IdentityUser? Player {get; set;}

        public long GameRoomId {get; set;}
        [ForeignKey("GameRoomId")]
        public virtual GameRoom? GameRoom {get; set;}
    }

    public class PlayersPerRoomDto
    {
        public string PlayersPerRoomId {get; set;}

        public string PlayerId {get; set;}

        public string GameRoomId {get; set;}
    }
}