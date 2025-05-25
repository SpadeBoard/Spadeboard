using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Models.Cards;
using Models.Styles;
using Models.GameRooms;
using Models.DndItems;
using System.Configuration;
using Models.Bridge;
using Models.Files;

namespace Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<IdentityUser>(options)
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        builder.HasPostgresEnum<FileMetadataStatus>();

        // CHECKME: Do we want these as sets
        builder.Entity<CardFaceElementImage>();
        builder.Entity<CardFaceElementRt>();

        builder.Entity<CardFaceElement>().UseTptMappingStrategy();

        // NOTE: All for bridge tables
        // TODO: Refactor the nav async stuff
        /*builder
            .Entity<CardPositionPerRoom>()
            .HasOne(e => e.Card)
            .WithMany()
            .HasForeignKey(e => e.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
           .Entity<CardPositionPerRoom>()
           .HasOne(e => e.DndItem)
           .WithMany()
           .HasForeignKey(e => e.DndItemId)
           .OnDelete(DeleteBehavior.Cascade);

        builder
           .Entity<CardPositionPerRoom>()
           .HasOne(e => e.DndPosition)
           .WithMany()
           .HasForeignKey(e => e.DndPositionId)
           .OnDelete(DeleteBehavior.Cascade);

        builder
           .Entity<CardPositionPerRoom>()
           .HasOne(e => e.GameRoom)
           .WithMany()
           .HasForeignKey(e => e.GameRoomId)
           .OnDelete(DeleteBehavior.Restrict);*/

        // FIXME: TEMPORARY SEED DATA
        builder.Entity<GameRoom>()
            .HasData(new GameRoom
            {
                GameRoomId = 1
            }
        );
        
        builder.Entity<Style>()
            .HasData(
                new Style{ StyleId = 1}
            );

        builder.Entity<DndDragBoundary>()
            .HasData(
                new DndDragBoundary {
                    DndDragBoundaryId =1,
                    Width = "100",
                    Height = "100",
                    Border = "",
                    MaxWidth= ""
                }
            );

        builder.Entity<DndPosition>()
            .HasData(
                new DndPosition { DndPositionId = 1, X = -1, Y = -1 }
            );

        builder.Entity<DndItem>()
            .HasData(
                new DndItem {
                    DndItemId = 1, 
                    IsDraggable = true,
                    IsDroppable=true,
                }
            );

        builder.Entity<IdentityUser>().HasData(
            new IdentityUser
            {
                Id = "5811e387-1551-4090-9485-a3ebe30efb5a",
                UserName = "admin@example.com",
                NormalizedUserName = "ADMIN@EXAMPLE.COM",
                Email = "admin@example.com",
                NormalizedEmail = "ADMIN@EXAMPLE.COM",
                EmailConfirmed = true,
                PasswordHash = "AQAAAAEAACcQAAAAEHxWQJXVnSwbllXjlXXNP0wy7Nq/qOEDkxVXNPVVvJ8Vp74knQlLf9AjvTqrTw==",
                SecurityStamp = Guid.NewGuid().ToString(),
                ConcurrencyStamp = Guid.NewGuid().ToString()
            }
        );
        // Customize the ASP.NET Identity model and override the defaults if needed.
        // For example, you can rename the ASP.NET Identity table names and more.
        // Add your customizations after calling base.OnModelCreating(builder);
    }

    public DbSet<Card> Card { get; set; } = default!;

    public DbSet<CardFace> CardFace { get; set; } = default!;

    public DbSet<CardFaceElement> CardFaceElement { get; set; } = default!;
    
    public DbSet<Style> Style { get; set; } = default!;

    public DbSet<GameRoom> GameRoom { get; set; } = default!;

    public DbSet<DndItem> DndItem { get; set; } = default!;

    public DbSet<DndDragBoundary> DndDragBoundary {get;set;} = default!;

    public DbSet<DndPosition> DndPosition {get;set;} = default!;

    public DbSet<CardPositionPerRoom> CardPositionPerRoom {get;set;} = default!;

    public DbSet<IdentityUser> Users { get; set; } = default!;

    public DbSet<CardFaceElementPerCardFace> CardFaceElementPerCardFace{ get; set; } = default!;

    public DbSet<CardPerOwner> CardPerOwner{ get; set; } = default!;

    public DbSet<CardFacePerCard> CardFacePerCard { get; set; } = default!;

    public DbSet<FileMetadata> FileMetadata {get; set;} = default!;

}
