namespace MySystem.Service.Embedding;

public interface IEmbeddingService
{
    Task<float[]> GetEmbedding(string text);
}
