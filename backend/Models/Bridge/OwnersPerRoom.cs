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
    [Table("OwnersPerRoom")]
    public class OwnersPerRoom: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long OwnersPerRoomId {get; set;}

        [NotMapped]
        public long Id { get => OwnersPerRoomId; set =>OwnersPerRoomId = value; }

        public string OwnerId {get; set;}
        [ForeignKey("PlayerId")]
        public virtual IdentityUser? Owner {get; set;}

        public long GameRoomId {get; set;}
        [ForeignKey("GameRoomId")]
        public virtual GameRoom? GameRoom {get; set;}
    }

    public class OwnersPerRoomDto
    {
        public string OwnersPerRoomId {get; set;}

        public string OwnerId {get; set;}

        public string GameRoomId {get; set;}
    }
}