using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using MySystem.API.Controllers;
using MySystem.API.Extensions;
using MySystem.API.Middleware;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Media;
using MySystem.Service.Embedding;
using MySystem.Service.Rag;
using MediaService = MySystem.Service.Media.Service;

var cloudinary = DispatchProxy.Create<ICloudinaryUploadApi, UploadProxy>();
var upload = (UploadProxy)(object)cloudinary;
var builder = WebApplication.CreateBuilder();
builder.Logging.ClearProviders();
builder.WebHost.UseUrls("http://127.0.0.1:0");
builder.Services.AddControllers().AddApplicationPart(typeof(MediaController).Assembly);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerServices();
builder.Services.AddAuthentication("test").AddScheme<AuthenticationSchemeOptions, TestAuth>("test", _ => { });
builder.Services.AddAuthorization(options =>
    options.AddPolicy(JwtExtensions.AdminPolicy, policy => policy.RequireRole("Admin")));
builder.Services.ConfigureRateLimiter();
builder.Services.AddTransient<GlobalExceptionHandlerMiddleware>();
builder.Services.AddSingleton(cloudinary);
builder.Services.Configure<CloudinaryOptions>(options => { options.Folder = "checks"; options.CloudName = "profile-check-cloud"; });
builder.Services.AddScoped<MySystem.Service.Media.IService, MediaService>();
var profileDatabase = Guid.NewGuid().ToString();
builder.Services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(profileDatabase));
builder.Services.AddSingleton(new MySystem.Service.JwtService.JwtOption());
builder.Services.AddScoped<MySystem.Service.Auth.IService>(services => new MySystem.Service.Auth.Service(
    services.GetRequiredService<AppDbContext>(), null!, null!, services.GetRequiredService<MySystem.Service.JwtService.JwtOption>()));
builder.Services.AddScoped<MySystem.Service.Auth.AvatarService>();
await using var app = builder.Build();
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
app.UseSwagger();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();
await app.StartAsync();
using var client = new HttpClient
{
    BaseAddress = new Uri(app.Services.GetRequiredService<IServer>()
        .Features.Get<IServerAddressesFeature>()!.Addresses.Single())
};

const string endpoint = "/api/v1/Media/upload-image";
var png = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4ioAAAAASUVORK5CYII=");
await ExpectUpload(png, "test.png", "image/png", HttpStatusCode.Unauthorized);
await ExpectDelete("checks/image", HttpStatusCode.Unauthorized);
client.DefaultRequestHeaders.Add("X-Test-User", "media-check");
await ExpectDelete("checks/image", HttpStatusCode.Forbidden);
Check(upload.DeleteCalls == 0, "Unauthenticated and non-admin users cannot delete images");
await ExpectUpload(png, "test.png", "image/png", HttpStatusCode.OK);
Check(upload.Bytes!.SequenceEqual(png), "Cloudinary receives the full image, including its header");
Check(upload.Parameters!.Folder == "checks" && upload.Parameters.Overwrite == false,
    "Cloudinary uses the configured folder without overwriting");
var firstId = upload.Parameters.PublicId;
await ExpectUpload(png, "test.png", "image/png", HttpStatusCode.OK);
Check(upload.Parameters.PublicId != firstId, "Uploads use distinct public IDs");
var calls = upload.Calls;
await ExpectUpload([], "empty.png", "image/png", HttpStatusCode.BadRequest, "IMAGE_REQUIRED");
await ExpectUpload(png, "test.exe", "image/png", HttpStatusCode.BadRequest, "INVALID_IMAGE_TYPE");
await ExpectUpload(png, "test.png", "text/plain", HttpStatusCode.BadRequest, "INVALID_IMAGE_TYPE");
await ExpectUpload("this is not an image"u8.ToArray(), "test.png", "image/png",
    HttpStatusCode.BadRequest, "INVALID_IMAGE_CONTENT");
await ExpectUpload(new byte[MediaService.MaxImageSize + 1], "big.png", "image/png",
    HttpStatusCode.BadRequest, "IMAGE_TOO_LARGE");
Check(upload.Calls == calls, "Rejected files never reach Cloudinary");
using (var empty = new MultipartFormDataContent())
using (var response = await client.PostAsync(endpoint, empty))
    Check(response.StatusCode == HttpStatusCode.BadRequest, "Missing file fails model binding");
upload.Result = new ImageUploadResult { Error = new Error { Message = "Provider error" } };
await ExpectUpload(png, "test.png", "image/png", HttpStatusCode.InternalServerError, "CLOUDINARY_UPLOAD_FAILED");
upload.Result = new ImageUploadResult();
await ExpectUpload(png, "test.png", "image/png", HttpStatusCode.InternalServerError, "CLOUDINARY_UPLOAD_FAILED");
upload.Result = new ImageUploadResult { SecureUrl = new Uri("https://example.com/image.png") };
await ExpectUpload(png, "test.png", "image/png", HttpStatusCode.InternalServerError, "CLOUDINARY_UPLOAD_FAILED");
client.DefaultRequestHeaders.Add("X-Test-Role", "Admin");
await ExpectDelete("checks/folder/image", HttpStatusCode.OK);
Check(upload.DeletionParameters!.PublicId == "checks/folder/image"
      && upload.DeletionParameters.ResourceType == ResourceType.Image
      && upload.DeletionParameters.Type == "upload"
      && upload.DeletionParameters.Invalidate == true,
    "Deletion sends the full public ID, targets images and invalidates CDN copies");
var deleteCalls = upload.DeleteCalls;
await ExpectDelete(null, HttpStatusCode.BadRequest);
await ExpectDelete("", HttpStatusCode.BadRequest);
await ExpectDelete("   ", HttpStatusCode.BadRequest);
Check(upload.DeleteCalls == deleteCalls, "Missing and blank public IDs never reach Cloudinary");
upload.DeleteResult = new DeletionResult { Result = "not found" };
await ExpectDelete("checks/missing", HttpStatusCode.NotFound, "CLOUDINARY_IMAGE_NOT_FOUND");
upload.DeleteResult = new DeletionResult { Result = "ok", Error = new Error { Message = "Provider error" } };
await ExpectDelete("checks/image", HttpStatusCode.InternalServerError, "CLOUDINARY_DELETE_FAILED");
upload.DeleteResult = new DeletionResult();
await ExpectDelete("checks/image", HttpStatusCode.InternalServerError, "CLOUDINARY_DELETE_FAILED");
using (var swagger = JsonDocument.Parse(await client.GetStringAsync("/swagger/v1/swagger.json")))
{
    Check(swagger.RootElement.GetProperty("paths").GetProperty(endpoint).GetProperty("post")
        .GetProperty("requestBody").GetProperty("content").TryGetProperty("multipart/form-data", out _),
        "Swagger exposes the multipart upload form");
    Check(swagger.RootElement.GetProperty("paths").GetProperty("/api/v1/Media/delete-image")
        .GetProperty("delete").GetProperty("requestBody").GetProperty("content")
        .TryGetProperty("application/json", out _), "Swagger exposes the delete request body");
}
await ProfileChecks.RunAsync(app.Services, client, upload, png);
await app.StopAsync();

// Exercise both real RAG generation paths against a recording HTTP handler.
await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
    .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
db.Products.Add(new Product { Id = Guid.NewGuid(), Name = "Sản phẩm", SKU = "CHECK",
    Embedding = [1f, 0f], EmbeddingContent = "Tên: Sản phẩm. Giá: 100000đ." });
await db.SaveChangesAsync();
var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
{
    ["Groq:ApiKey"] = "test-key", ["Groq:Model"] = "configured-model",
    ["Ollama:SimilarityThreshold"] = "0.5"
}).Build();
var handler = new RagHttpHandler();
var rag = new RagService(db, new Embeddings(), new Clients(handler), config, NullLogger<RagService>.Instance);
Check((await rag.AskQuestion(new() { Question = "Tư vấn" })).Answer == "Câu trả lời",
    "RAG parses the Groq answer");
var chunks = new List<string>();
await foreach (var chunk in rag.AskQuestionStream(new() { Question = "Tư vấn" })) chunks.Add(chunk);
Check(chunks.Last() == "Câu trả lời", "RAG parses Groq SSE chunks");
Check(handler.Paths.Count == 2 && handler.Paths.All(path => path == "/openai/v1/chat/completions"),
    "Normal and streaming chat call the correct Groq endpoint");
Console.WriteLine("All media/RAG checks passed. Cloudinary and Groq were simulated; no external uploads, deletions or AI calls were made.");

async Task ExpectUpload(byte[] bytes, string name, string mime, HttpStatusCode status, string? code = null)
{
    using var body = new MultipartFormDataContent();
    using var file = new ByteArrayContent(bytes);
    file.Headers.ContentType = new MediaTypeHeaderValue(mime);
    body.Add(file, "file", name);
    using var response = await client.PostAsync(endpoint, body);
    Check(response.StatusCode == status, $"{name} ({mime}): expected {status}, got {response.StatusCode}");
    if (code != null || status == HttpStatusCode.OK)
    {
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        if (code != null) Check(json.RootElement.GetProperty("messageCode").GetString() == code, code);
        else
        {
            Check(json.RootElement.GetProperty("data").GetProperty("url").GetString() == "https://example.com/image.png",
                "Successful upload returns data.url");
            Check(json.RootElement.GetProperty("data").GetProperty("publicId").GetString() == "checks/image",
                "Successful upload returns data.publicId for deletion");
        }
    }
}

async Task ExpectDelete(string? publicId, HttpStatusCode status, string? code = null)
{
    using var request = new HttpRequestMessage(System.Net.Http.HttpMethod.Delete, "/api/v1/Media/delete-image")
    {
        Content = JsonContent.Create(new { publicId })
    };
    using var response = await client.SendAsync(request);
    Check(response.StatusCode == status, $"Delete {publicId ?? "<null>"}: expected {status}, got {response.StatusCode}");
    if (code != null || status == HttpStatusCode.OK)
    {
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        if (code != null) Check(json.RootElement.GetProperty("messageCode").GetString() == code, code);
        else Check(json.RootElement.GetProperty("success").GetBoolean()
                   && json.RootElement.GetProperty("data").GetProperty("publicId").GetString() == publicId,
            "Successful deletion returns the public ID");
    }
}

static void Check(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
    Console.WriteLine($"PASS: {message}");
}

public class UploadProxy : DispatchProxy
{
    public List<string> Events = [];
    public int Calls;
    public byte[]? Bytes;
    public ImageUploadParams? Parameters;
    public ImageUploadResult Result = new() { SecureUrl = new Uri("https://example.com/image.png"), PublicId = "checks/image" };
    public int DeleteCalls;
    public DeletionParams? DeletionParameters;
    public DeletionResult DeleteResult = new() { Result = "ok" };
    protected override object? Invoke(MethodInfo? method, object?[]? args)
    {
        if (method?.Name == "DestroyAsync")
        {
            Events.Add("delete");
            DeleteCalls++;
            DeletionParameters = (DeletionParams)args![0]!;
            return Task.FromResult(DeleteResult);
        }
        if (method?.Name != "UploadAsync") throw new NotSupportedException();
        Events.Add("upload");
        Calls++;
        Parameters = (ImageUploadParams)args![0]!;
        using var copy = new MemoryStream();
        Parameters.File.Stream.CopyTo(copy);
        Bytes = copy.ToArray();
        return Task.FromResult(Result);
    }
}

public class TestAuth(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync() => Task.FromResult(
        Request.Headers.ContainsKey("X-Test-User")
            ? AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(
                new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, Request.Headers["X-Test-User"].ToString()),
                    new Claim(ClaimTypes.Role, Request.Headers["X-Test-Role"].ToString())], "test")), "test"))
            : AuthenticateResult.NoResult());
}

public class Embeddings : IEmbeddingService
{
    public Task<float[]> GetEmbedding(string text) => Task.FromResult(new[] { 1f, 0f });
}

public class Clients(RagHttpHandler handler) : IHttpClientFactory
{
    public HttpClient CreateClient(string name) => new(handler, disposeHandler: false)
        { BaseAddress = new Uri("https://api.groq.com") };
}

public class RagHttpHandler : HttpMessageHandler
{
    public List<string> Paths { get; } = [];
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
    {
        Paths.Add(request.RequestUri!.AbsolutePath);
        if (request.Headers.Authorization?.ToString() != "Bearer test-key")
            throw new InvalidOperationException("Missing Groq API key");
        using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(token));
        if (body.RootElement.GetProperty("model").GetString() != "configured-model")
            throw new InvalidOperationException("Configured Groq model was ignored");
        var stream = body.RootElement.GetProperty("stream").GetBoolean();
        var json = stream
            ? "data: {\"choices\":[{\"delta\":{\"content\":\"Câu trả lời\"}}]}\n\ndata: [DONE]\n\n"
            : "{\"choices\":[{\"message\":{\"content\":\"Câu trả lời\"}}]}";
        return new HttpResponseMessage(HttpStatusCode.OK)
            { Content = new StringContent(json, Encoding.UTF8, stream ? "text/event-stream" : "application/json") };
    }
}
