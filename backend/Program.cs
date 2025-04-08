using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Data;
using Services;


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
            policy.WithOrigins("http://localhost:4200", 
                "http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<ICardService, CardService>();
builder.Services.AddScoped<ICardFaceService, CardFaceService>();
builder.Services.AddScoped<ICardFaceElementService, CardFaceElementService>();
builder.Services.AddScoped<IDndItemService, DndItemService>();

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


// For migrations that need to be updated to database, only do for developmenet, not production
using (IServiceScope scope = serviceProvider.CreateScope())
{
    ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync();
}

app.Run();
