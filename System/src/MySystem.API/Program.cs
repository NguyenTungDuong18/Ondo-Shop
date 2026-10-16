using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using MySystem.API.Extensions;
using MySystem.API.Infrastructure;
using MySystem.API.Middleware;
using MySystem.Repository;
using MySystem.Repository.Abstractions;
using MySystem.Repository.Entities;
using Category = MySystem.Repository.Entities.Category;
using MySystem.Service;
using MySystem.Service.Cache;
using MySystem.Service.Mail;
using CloudinaryDotNet;
using Microsoft.Extensions.Options;
using MySystem.Service.Media;
using MySystem.Service.Exceptions;
using AuthService = MySystem.Service.Auth;
using ProductService = MySystem.Service.Product;
using CategoryService = MySystem.Service.Category;
using OrderService = MySystem.Service.Order;
using AssemblyReference = MySystem.Service.AssemblyReference;

var builder = WebApplication.CreateBuilder(args);

// Add Global Exception Middleware
builder.Services.AddTransient<GlobalExceptionHandlerMiddleware>();

// Add Controllers with JSON serialization settings
builder.Services.AddControllers(options =>
    {
        options.Filters.Add<MySystem.API.Filters.ValidationActionFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// OpenAPI & Swagger Setup
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerServices();

// Configure PostgreSQL DbContext with Npgsql and Pgvector mapping
var connectionString = builder.Configuration.GetConnectionString("PostgresSql");
var dataSourceBuilder = new Npgsql.NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.UseVector();
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        dataSource,
        o => o.UseVector()
    )
);

// Register HTTP Client and RAG Services
builder.Services.AddHttpClient<MySystem.Service.Embedding.IEmbeddingService, MySystem.Service.Embedding.EmbeddingService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Ollama:BaseUrl"] ?? "http://localhost:11434");
});

builder.Services.AddScoped<MySystem.Service.Rag.IRagService, MySystem.Service.Rag.RagService>();

builder.Services.AddHttpClient("RagChat.Ollama", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Ollama:BaseUrl"] ?? "http://localhost:11434");
});
builder.Services.AddHttpClient("RagChat.Groq", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Groq:BaseUrl"] ?? "https://api.groq.com");
});

// Register Rate Limiting, JWT Authentication, Redis Cache
builder.Services.AddHttpContextAccessor();
builder.Services.ConfigureRateLimiter();
builder.Services.AddJwtServices(builder.Configuration);
builder.Services.AddDistributedMemoryCache();

// Register Cache Service
builder.Services.AddSingleton<ICacheService, RedisCacheService>();

// Register Mail Option & Service
var mailOption = new MailOption();
builder.Configuration.GetSection(nameof(MailOption)).Bind(mailOption);
builder.Services.AddSingleton(mailOption);
builder.Services.AddScoped<IMailService, MailService>();

// Register Service Layer - Theo chuẩn HoaTheoMua
builder.Services.AddScoped<AuthService.IService, AuthService.Service>();
builder.Services.AddScoped<AuthService.AvatarService>();
builder.Services.AddScoped<ProductService.IService, ProductService.Service>();
builder.Services.AddScoped<CategoryService.IService, CategoryService.Service>();
builder.Services.AddScoped<OrderService.IService, OrderService.Service>();

// Cloudinary credentials are checked only when a media operation is requested.
builder.Services.Configure<CloudinaryOptions>(builder.Configuration.GetSection(nameof(CloudinaryOptions)));
builder.Services.AddSingleton<ICloudinaryUploadApi>(services =>
{
    var options = services.GetRequiredService<IOptions<CloudinaryOptions>>().Value;
    if (string.IsNullOrWhiteSpace(options.CloudName) || string.IsNullOrWhiteSpace(options.ApiKey)
        || string.IsNullOrWhiteSpace(options.ApiSecret))
    {
        throw new ServerException("Chưa cấu hình CloudinaryOptions.", "CLOUDINARY_NOT_CONFIGURED");
    }

    var cloudinary = new Cloudinary(new Account(options.CloudName, options.ApiKey, options.ApiSecret));
    cloudinary.Api.Secure = true;
    return cloudinary;
});
builder.Services.AddScoped<MySystem.Service.Media.IService, MySystem.Service.Media.Service>();

// AutoMapper - Register all mapping profiles from Service assembly
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(AssemblyReference.Assembly);
});

// FluentValidation - Register validators from Service assembly
builder.Services.AddValidatorsFromAssembly(AssemblyReference.Assembly);

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure SignalR Services (CORS Policy & SignalR Hub registration)
builder.Services.AddSignalRServices();

var app = builder.Build();

// Create the database when it is absent, then apply idempotent relational seed data.
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await ProfileSchema.EnsureAsync(dbContext);
    await ChatSchema.EnsureAsync(dbContext);
    await DatabaseSeeder.SeedAsync(dbContext);
}
catch (Exception ex)
{
    app.Logger.LogWarning(ex, "Unable to initialize PostgreSQL and seed the application data.");
}

// HTTP request pipeline configuration
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwaggerAPI();
}

app.UseRouting();

app.UseCors("AllowAll");
app.UseRateLimiter();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// Register SignalR endpoints (Map ChatHub with CORS SignalRPolicy)
app.MapSignalRHubs();

app.Run();
