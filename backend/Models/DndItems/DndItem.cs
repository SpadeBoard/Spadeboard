using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using Models.Styles;

namespace Models.DndItems
{
    public class DndItemDto
    {
        public string DndItemId { get; set; } = "0";
        public bool IsDraggable { get; set; }
        public bool IsDroppable { get; set; }
    }

    public class DndPositionDto
    {
        public string DndPositionId { get; set; } = "0";

        public float? X { get; set; }
        public float? Y { get; set; }
    }

    [Table("DndPositions")]
    public class DndPosition
    {
        // TODO: If position already exists, then use it, don't need for an ID? Unless we want to keep history
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long DndPositionId { get; set; }

        public float? X { get; set; }
        public float? Y { get; set; }

        // Navigation property
        // public DndItem? DndItem { get; set; }
    }

    [Table("DndDragBoundaries")]
    public class DndDragBoundary
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long DndDragBoundaryId { get; set; }

        public string? Width { get; set; }
        public string? Height { get; set; }
        public string? MaxWidth { get; set; }
        public string? Border { get; set; }
    }

    public class DndDragBoundaryDto 
    {
        public string DndDragBoundaryId { get; set; } = "0";

        public string? Width { get; set; }
        public string? Height { get; set; }
        public string? MaxWidth { get; set; }
        public string? Border { get; set; }
    }

    [Table("DndItems")]
    public class DndItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long DndItemId { get; set; }

        [Required]
        public bool IsDraggable { get; set; }

        [Required]
        public bool IsDroppable { get; set; }
    }
}
