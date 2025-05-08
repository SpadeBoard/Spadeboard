using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models.GameRooms
{
    [Table("GameRooms")] // Maps this entity to the "Game Room" table
    public class GameRoom
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long GameRoomId { get; set; }
    }
}