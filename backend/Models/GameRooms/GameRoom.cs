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

        public int AutosaveInterval {get; set;} = 300000;

        public int DndBoardSize { get; set;} = 1000;
    }

    public class GameRoomDto
    {
        public string GameRoomId { get; set; } = "0";

         public int AutosaveInterval {get; set;} = 300000;

         public int DndBoardSize { get; set;} = 1000;
    }
}