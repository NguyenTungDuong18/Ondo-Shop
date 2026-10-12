using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;

namespace MySystem.Service.Embedding;

public class EmbeddingService : IEmbeddingService
{
    private readonly HttpClient _httpClient;
    private readonly string _embeddingModel;

    public EmbeddingService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _embeddingModel = configuration["Ollama:EmbeddingModel"] ?? "nomic-embed-text";
    }

    public async Task<float[]> GetEmbedding(string text)
    {
        var response = await _httpClient.PostAsJsonAsync("/api/embed", new
        {
            model = _embeddingModel,
            input = text
        });
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<EmbedResponse>();
        if (result == null || result.Embeddings == null || result.Embeddings.Length == 0)
        {
            throw new Exception("Failed to retrieve embeddings from Ollama.");
        }
        return result.Embeddings[0];
    }

    private record EmbedResponse(float[][] Embeddings);
}
