using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Data;
using Services;
using AutoMapper;
using Mapper;
using System.Text.Json.Serialization;


string DevelopmentOrigins = "_devOrigins";

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("ApplicationDbContextConnection") ?? throw new InvalidOperationException("Connection string 'ApplicationDbContextConnection' not found.");;

builder.Services.AddDbContext<ApplicationDbContext>(options => 
    options.UseNpgsql(connectionString)
);

builder.Services
    .AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: DevelopmentOrigins,
        policy =>
        {
            policy
                .SetIsOriginAllowed(origin =>
                    origin.StartsWith("http://10.") && origin.EndsWith(":4200") || // Guest VM and other computers on physical network if bridged adapter
                    origin.StartsWith("http://localhost") // Host machine frontend
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IFileUploadService, FileUploadService>();

builder.Services.AddScoped<IGameRoomService, GameRoomService>();

builder.Services.AddScoped<ICardService, CardService>();
builder.Services.AddScoped<ICardPerOwnerService, CardPerOwnerService>();
builder.Services.AddScoped<ICardPositionPerRoomService, CardPositionPerRoomService>();
builder.Services.AddScoped<ICardFaceService, CardFaceService>();
builder.Services.AddScoped<ICardFacePerCardService, CardFacePerCardService>();
builder.Services.AddScoped<ICardFaceElementService, CardFaceElementService>();
builder.Services.AddScoped<ICardFaceElementPerCardFaceService, CardFaceElementPerCardFaceService>();
builder.Services.AddScoped<ICardFacePerCardDtoService, CardFacePerCardDtoService>();
builder.Services.AddScoped<ICardFaceElementPerCardFaceDtoService, CardFaceElementPerCardFaceDtoService>();
builder.Services.AddScoped<ICardPerOwnerDtoService, CardPerOwnerDtoService>();

builder.Services.AddScoped<IDndItemService, DndItemService>();
builder.Services.AddScoped<IDndPositionService, DndPositionService>();
builder.Services.AddScoped<IDndRotationService, DndRotationService>();

builder.Services.AddScoped<IStyleService, StyleService>();

builder.Services.AddScoped<ICardDtoService, CardDtoService>();
builder.Services.AddScoped<ICardEditorCardFaceDtoService, CardEditorCardFaceDtoService>();
builder.Services.AddScoped<ICardFaceDtoService, CardFaceDtoService>();
builder.Services.AddScoped<ICardFaceElementDtoService, CardFaceElementDtoService>();
builder.Services.AddScoped<ICardEditorCardDtoService, CardEditorCardDtoService>();

builder.Services.AddScoped<IDndItemDtoService, DndItemDtoService>();
builder.Services.AddScoped<IStyleDtoService, StyleDtoService>();
builder.Services.AddScoped<IGameRoomDtoService, GameRoomDtoService>();

builder.Services.AddScoped<ICardPositionPerRoomDtoService, CardPositionPerRoomDtoService>();

builder.Services.AddScoped<IFileMetadataService, FileMetadataService>();
builder.Services.AddScoped<IFileMetadataDtoService, FileMetadataDtoService>();
builder.Services.AddHostedService<FileCleanupService>();

builder.Services.AddControllers().AddJsonOptions(options =>{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()); 
    // options.JsonSerializerOptions.AllowOutOfOrderMetadataProperties = true; // https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/polymorphism By default, the $type discriminator must be placed at the start of the JSON object, grouped together with other metadata properties like $id and $ref. - TODO: only in .NET9, so let's upgrade
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;  // Problem is if we don't add this, the serialization type has to match exactly, CardFaceElementType in backend vs. cardFaceElementType in frontend // FIXME: Makes no sense why this isn't working
});

// Auto Mapper Configurations
var mapperConfig = new MapperConfiguration(mc =>
{
    mc.AddProfile(new CardGameCoreMappingProfile());
});

mapperConfig.AssertConfigurationIsValid();

IMapper mapper = mapperConfig.CreateMapper();
builder.Services.AddSingleton(mapper);

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// Get the service provider
IServiceProvider serviceProvider = app.Services;

app.UseSwagger();
app.UseSwaggerUI();

app.UseSwaggerUI(options => // UseSwaggerUI is called only in Development.
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
        options.RoutePrefix = string.Empty;
    });

app.UseSwagger(options =>
{
    options.SerializeAsV2 = true;
});

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors(DevelopmentOrigins);

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// In Program.cs
/*app.MapPost("/app/backend/card-face-thumbnail-images", async (IFormFile file) => {
    var uploadPath = "/app/backend/card-face-thumbnail-images"; // Docker volume mount point
    var uniqueFileName = $"{Guid.NewGuid()}.webp";
    var filePath = Path.Combine(uploadPath, uniqueFileName);

    using var stream = new FileStream(filePath, FileMode.Create);
    await file.CopyToAsync(stream);
    
    return Results.Ok($"/uploads/{uniqueFileName}");
}).Accepts<IFormFile>("image/webp");*/

// https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-9.0

// For migrations that need to be updated to database, only do for developmenet, not production
using (IServiceScope scope = serviceProvider.CreateScope())
{
    ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
    
    if (pendingMigrations.Any())
    {
        await dbContext.Database.MigrateAsync();
    }
}

app.Run();
