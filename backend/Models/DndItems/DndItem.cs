using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using Models.Styles;

namespace Models.DndItems
{
    [Table("DndPositions")]
    public class DndPosition
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DndPositionId { get; set; }

        public float? X { get; set; }
        public float? Y { get; set; }

        // Navigation property
        public DndItem? DndItem { get; set; }
    }

    [Table("DndDragBoundaries")]
    public class DndDragBoundary
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DndDragBoundaryId { get; set; }

        public string? Width { get; set; }
        public string? Height { get; set; }
        public string? MaxWidth { get; set; }
        public string? Border { get; set; }

        // Navigation property
        public DndItem? DndItem { get; set; }
    }

    public class DndItemCreateDto 
    {
        [Required]
        public bool IsDraggable { get; set; }

        [Required]
        public bool IsDroppable { get; set; }

        [Required, AllowNull]
        // Foreign key for DndPosition
        public int DndPositionId { get; set; }
        [ForeignKey("DndPositionId")]
        public DndPosition? DndPosition { get; set; }

        // Foreign key for DndDragBoundary
        [Required, AllowNull]
        public int DndDragBoundaryId { get; set; }
        [ForeignKey("DndDragBoundaryId")]
        public DndDragBoundary? DndDragBoundary { get; set; }
    
        [Required, AllowNull]
        public int StyleId {get; set;}
        [ForeignKey("StyleId")]
        public Style? Style {get; set;}
    }

    [Table("DndItems")]
    public class DndItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DndItemId { get; set; }

        [Required]
        public bool IsDraggable { get; set; }

        [Required]
        public bool IsDroppable { get; set; }

        [Required, AllowNull]
        // Foreign key for DndPosition
        public int DndPositionId { get; set; }
        [ForeignKey("DndPositionId")]
        public DndPosition? DndPosition { get; set; }

        // Foreign key for DndDragBoundary
        [Required, AllowNull]
        public int DndDragBoundaryId { get; set; }
        [ForeignKey("DndDragBoundaryId")]
        public DndDragBoundary? DndDragBoundary { get; set; }
    
        [Required, AllowNull]
        public int StyleId {get; set;}
        [ForeignKey("StyleId")]
        public Style? Style {get; set;}
    }
}
