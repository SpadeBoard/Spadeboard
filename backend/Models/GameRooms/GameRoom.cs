using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Services;

namespace Models.GameRooms
{
    [Table("GameRooms")] // Maps this entity to the "Game Room" table
    public class GameRoom: ICrudId
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long GameRoomId { get; set; }

         [NotMapped]
        public long Id { get => GameRoomId; set => GameRoomId = value; }
    }

    public class GameRoomDto
    {
        public string GameRoomId { get; set; } = "0";
    }
}