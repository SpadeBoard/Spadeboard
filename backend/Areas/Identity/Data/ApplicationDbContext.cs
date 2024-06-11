using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Models.Cards;
using Models.Styles;
using Models.GameRooms;
using Models.DndItems;
using System.Configuration;
using Models.Bridge;

namespace Data;

public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // CHECKME: Use .ValueGeneratedOnAdd or .ValueGeneratedOnAddOrUpdate
        builder.Entity<Style>()
            .Property(p => p.StyleId)
            .ValueGeneratedOnAdd();
            //.ValueGeneratedOnAddOrUpdate();

        builder.Entity<DndItem>()
            .Property(p => p.DndItemId)
            .ValueGeneratedOnAdd();

        builder.Entity<DndPosition>()
            .Property(p => p.DndPositionId)
            .ValueGeneratedOnAdd();

        builder.Entity<DndDragBoundary>()
            .Property(p => p.DndDragBoundaryId)
            .ValueGeneratedOnAdd();

        builder.Entity<Card>()
            .Property(p => p.CardId)
            .ValueGeneratedOnAdd();

        builder.Entity<Card>()
            .HasOne<IdentityUser>(c => c.Owner)
            .WithOne()
            .HasForeignKey<Card>(c => c.OwnerId)
            .IsRequired(false);

        builder.Entity<CardFace>()
            .Property(p => p.CardFaceId)
            .ValueGeneratedOnAdd();

        builder.Entity<CardFaceElement>()
            .Property(p => p.CardFaceElementId)
            .ValueGeneratedOnAdd();

        builder.Entity<GameRoom>()
            .Property(p => p.GameRoomId)
            .ValueGeneratedOnAdd();

        builder.Entity<CardPositionPerRoom>()
            .Property(p => p.CardPositionPerRoomId)
            .ValueGeneratedOnAdd();


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

        // Prevent circular reference
        builder.Entity<DndPosition>()
            .HasOne(dndPosition => dndPosition.DndItem)
            .WithOne(dndItem => dndItem.DndPosition)
            .HasForeignKey<DndItem>(dndItem => dndItem.DndPositionId);

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
                    DndPositionId = 1,
                    DndDragBoundaryId = 1,
                    StyleId = 1
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

        // Please for the love of God stop giving me the 
        /*
        {
            "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
            "title": "One or more validation errors occurred.",
            "status": 400,
            "errors": {
                "DndItem": [
                    "The DndItem field is required."
                ]
            },
            "traceId": "00-fef42757ea5c358a966ac1890ae41229-617ebc7dabe71283-00"
        }

        The model only has the foreign key required, why is it asking for the actual item itself, also it's already in the database
        */
        /*builder.Entity<Card>()
            .HasOne(card => card.DndItem)
            .WithOne()
            .HasForeignKey<Card>(card => card.DndItemId)
            .IsRequired();*/
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

    public DbSet<IdentityUser> Users { get; set; }
}
