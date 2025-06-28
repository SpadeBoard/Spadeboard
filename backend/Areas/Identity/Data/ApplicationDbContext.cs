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
using Models.Tags;

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

        // NOTE: We assume that there could be multiple cards for one room
        builder.Entity<CardPositionPerRoom>()
            .HasOne(cp => cp.Card)
            .WithOne()
            .HasForeignKey<CardPositionPerRoom>(cp => cp.CardId)
            .IsRequired();

        builder.Entity<CardPositionPerRoom>()
            .HasOne(cp => cp.DndItem)
            .WithOne()
            .HasForeignKey<CardPositionPerRoom>(cp => cp.DndItemId)
            .IsRequired();

        builder.Entity<CardPositionPerRoom>()
            .HasOne(cp => cp.DndPosition)
            .WithOne()
            .HasForeignKey<CardPositionPerRoom>(cp => cp.DndPositionId)
            .IsRequired();

        builder.Entity<CardPositionPerRoom>()
            .HasOne(cp => cp.DndRotation)
            .WithOne()
            .HasForeignKey<CardPositionPerRoom>(cp => cp.DndRotationId)
            .IsRequired();

        builder.Entity<CardPositionPerRoom>()
            .HasOne(cp => cp.GameRoom)
            .WithMany()
            .HasForeignKey(cp => cp.GameRoomId)
            .IsRequired();

        builder.Entity<CardFacePerCard>()
            .HasOne(cp => cp.CardFace)
            .WithOne()
            .HasForeignKey<CardFacePerCard>(cp => cp.CardFaceId)
            .IsRequired();

        builder.Entity<CardFacePerCard>()
            .HasOne(cp => cp.Card)
            .WithMany()
            .HasForeignKey(cp => cp.CardId)
            .IsRequired();

        builder.Entity<CardPerOwner>()
            .HasOne(cpo => cpo.Card)
            .WithOne()
            .HasForeignKey<CardPerOwner>(cpo => cpo.CardId)
            .IsRequired();

        builder.Entity<CardPerOwner>()
            .HasOne(cpo => cpo.Owner)
            .WithMany()
            .HasForeignKey(cpo => cpo.OwnerId)
            .IsRequired();

        builder.Entity<CardFaceElementPerCardFace>()
            .HasOne(cp => cp.CardFaceElement)
            .WithOne()
            .HasForeignKey<CardFaceElementPerCardFace>(cp => cp.CardFaceElementId)
            .IsRequired();

        builder.Entity<CardFaceElementPerCardFace>()
            .HasOne(cp => cp.DndItem)
            .WithOne()
            .HasForeignKey<CardFaceElementPerCardFace>(cp => cp.DndItemId)
            .IsRequired();

        builder.Entity<CardFaceElementPerCardFace>()
            .HasOne(cp => cp.DndPosition)
            .WithOne()
            .HasForeignKey<CardFaceElementPerCardFace>(cp => cp.DndPositionId)
            .IsRequired();

        builder.Entity<CardFaceElementPerCardFace>()
            .HasOne(cp => cp.CardFace)
            .WithMany()
            .HasForeignKey(cp => cp.CardFaceId)
            .IsRequired();


        /*****************************************************************/
        // https://code-maze.com/efcore-add-unique-constraints-to-a-property-code-first/
        // https://stackoverflow.com/questions/49526370/is-there-a-data-annotation-for-unique-constraint-in-ef-core-code-first
        builder.Entity<PlayersPerRoom>()
            .HasIndex(a => new {a.PlayerId, a.GameRoomId})
            .IsUnique();

         builder.Entity<OwnersPerRoom>()
            .HasIndex(a => new {a.OwnerId, a.GameRoomId})
            .IsUnique();

        /*****************************************************************/
        builder.Entity<CardFace>()
            .HasOne(cp => cp.Style)
            .WithMany()
            .HasForeignKey(cp => cp.StyleId)
            .IsRequired(false);

        builder.Entity<CardFaceElement>()
            .HasOne(cp => cp.Style)
            .WithMany()
            .HasForeignKey(cp => cp.StyleId)
            .IsRequired(false);

        // TODO: Refactor the nav async stuff

        /*****************************************************************/
        builder.Entity<Tag>()
            .HasIndex(a => new {a.TagName})
            .IsUnique();

        builder.Entity<Tag>()
            .HasData(new Tag
            {
                TagId = 1,
                TagName="#template"
            }
        );

        /****************************************************************/
    
        // FIXME: TEMPORARY SEED DATA
        builder.Entity<GameRoom>()
            .HasData(new GameRoom
            {
                GameRoomId = 1
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

    public DbSet<DndRotation> DndRotation {get;set;} = default!;

    public DbSet<CardPositionPerRoom> CardPositionPerRoom {get;set;} = default!;

    public DbSet<IdentityUser> Users { get; set; } = default!;

    public DbSet<CardFaceElementPerCardFace> CardFaceElementPerCardFace{ get; set; } = default!;

    public DbSet<CardPerOwner> CardPerOwner{ get; set; } = default!;

    public DbSet<CardFacePerCard> CardFacePerCard { get; set; } = default!;

    public DbSet<FileMetadata> FileMetadata {get; set;} = default!;

    public DbSet<PlayersPerRoom> PlayersPerRoom {get; set;} = default!;

    public DbSet<OwnersPerRoom> OwnersPerRoom {get; set;} = default!;

    public DbSet<Tag> Tag {get; set;} =default!;

    public DbSet<FileAuthenticationPerExportedCard> FileAuthenticationPerExportedCard {get;set;} = default!;
}
