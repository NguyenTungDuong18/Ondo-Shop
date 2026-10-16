using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MySystem.Repository;
using MySystem.Repository.Entities;
using ProductEntity = MySystem.Repository.Entities.Product;
using MySystem.Service.Embedding;

namespace MySystem.Service.Rag;

public class RagService : IRagService
{
    private readonly AppDbContext _dbContext;
    private readonly IEmbeddingService _embeddingService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<RagService> _logger;
    private readonly string _ollamaChatModel;
    private readonly string _groqModel;
    private readonly string _groqApiKey;
    private readonly bool _useGroq;
    private readonly double _threshold;

    public RagService(
        AppDbContext dbContext,
        IEmbeddingService embeddingService,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<RagService> _logger)
    {
        _dbContext = dbContext;
        _embeddingService = embeddingService;
        _httpClientFactory = httpClientFactory;
        this._logger = _logger;
        _ollamaChatModel = configuration["Ollama:ChatModel"] ?? "qwen3:8b";
        _groqModel = configuration["Groq:Model"] ?? "llama-3.3-70b-versatile";
        _groqApiKey = configuration["Groq:ApiKey"] ?? "";
        _useGroq = !string.IsNullOrWhiteSpace(_groqApiKey);
        _threshold = double.TryParse(configuration["Ollama:SimilarityThreshold"], out var t) ? t : 0.5;
    }

    #region Indexing Functions

    public async Task<int> ReindexAllProducts()
    {
        var products = await _dbContext.Products
            .Where(p => !p.IsDeleted)
            .ToListAsync();

        int processedCount = 0;

        foreach (var p in products)
        {
            var content = $"Tên: {p.Name}. Danh mục: {p.Category}. Giá: {p.Price}đ. Mô tả: {p.Description}.";
            var vectorArray = await _embeddingService.GetEmbedding(content);

            p.EmbeddingContent = content;
            p.Embedding = vectorArray.ToList();
            p.UpdatedAt = DateTime.UtcNow;

            _dbContext.Products.Update(p);
            processedCount++;
        }

        await _dbContext.SaveChangesAsync();
        return processedCount;
    }

    #endregion

    #region Chat/Ask Functions

    public async Task<Response.AskResult> AskQuestion(Request.AskRequest request)
    {
        var overallStopwatch = Stopwatch.StartNew();

        var searchResult = await GetRelatedMatches(request.Question);
        if (searchResult == null)
        {
            overallStopwatch.Stop();
            _logger.LogInformation("RAG overall latency: {ElapsedMs}ms (No matching products found)", overallStopwatch.ElapsedMilliseconds);
            return new Response.AskResult(
                "Xin lỗi, tôi không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn tại cửa hàng.",
                new List<ProductEntity>()
            );
        }

        var (topMatches, _) = searchResult.Value;

        var context = string.Join("\n", topMatches.Select(m => $"- {m.EmbeddingContent}"));
        var systemPrompt = "Bạn là trợ lý tư vấn bán hàng AI của MySystem. Chỉ trả lời ngắn gọn," +
                           " lịch sự bằng tiếng Việt dựa trên thông tin sản phẩm được cung cấp." +
                           " Nếu không có sản phẩm phù hợp trong danh sách hoặc thông tin không rõ ràng," +
                           " hãy nói rõ là không tìm thấy sản phẩm phù hợp, tuyệt đối không tự bịa thông tin sản phẩm.";

        var userPrompt = $"Dưới đây là danh sách sản phẩm liên quan:\n{context}\n\nCâu hỏi khách hàng: {request.Question}";

        var llmStopwatch = Stopwatch.StartNew();
        string answer = "";
        string provider = "";

        if (_useGroq)
        {
            try
            {
                answer = await QueryGroq(systemPrompt, userPrompt);
                provider = "Groq";
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Groq API failed. Falling back to Ollama local.");
            }
        }

        if (string.IsNullOrEmpty(answer))
        {
            answer = await QueryOllama(systemPrompt, userPrompt);
            provider = provider == "" ? "Ollama" : $"Ollama (Fallback from {provider})";
        }

        llmStopwatch.Stop();
        _logger.LogInformation("RAG latency - LLM query ({Provider}): {ElapsedMs}ms", provider, llmStopwatch.ElapsedMilliseconds);

        overallStopwatch.Stop();
        _logger.LogInformation("RAG overall latency: {ElapsedMs}ms", overallStopwatch.ElapsedMilliseconds);

        return new Response.AskResult(answer, topMatches);
    }

    public async IAsyncEnumerable<string> AskQuestionStream(Request.AskRequest request)
    {
        (List<ProductEntity> topMatches, float[] queryVector)? searchResult = null;
        bool hasError = false;

        try
        {
            var res = await GetRelatedMatches(request.Question);
            if (res != null)
            {
                searchResult = res.Value;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to perform RAG search in stream mode.");
            hasError = true;
        }

        if (hasError)
        {
            yield return "Lỗi: Không thể xử lý câu hỏi lúc này.";
            yield break;
        }

        if (searchResult == null)
        {
            var emptyProductsJson = JsonSerializer.Serialize(new List<ProductEntity>());
            yield return $"[PRODUCTS]:{emptyProductsJson}";
            yield return "Xin lỗi, tôi không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn tại cửa hàng.";
            yield break;
        }

        var topMatches = searchResult.Value.topMatches;
        var productsJson = JsonSerializer.Serialize(topMatches);
        yield return $"[PRODUCTS]:{productsJson}";

        var context = string.Join("\n", topMatches.Select(m => $"- {m.EmbeddingContent}"));
        var systemPrompt = "Bạn là trợ lý tư vấn bán hàng AI của MySystem. Chỉ trả lời ngắn gọn," +
                           " lịch sự bằng tiếng Việt dựa trên thông tin sản phẩm được cung cấp." +
                           " Nếu không có sản phẩm phù hợp trong danh sách hoặc thông tin không rõ ràng," +
                           " hãy nói rõ là không tìm thấy sản phẩm phù hợp, tuyệt đối không tự bịa thông tin sản phẩm.";

        var userPrompt = $"Dưới đây là danh sách sản phẩm liên quan:\n{context}\n\nCâu hỏi khách hàng: {request.Question}";

        var streamedSuccessfully = false;
        string? firstChunk = null;
        IAsyncEnumerator<string>? groqEnumerator = null;

        if (_useGroq)
        {
            try
            {
                groqEnumerator = StreamGroq(systemPrompt, userPrompt).GetAsyncEnumerator();
                if (await groqEnumerator.MoveNextAsync())
                {
                    firstChunk = groqEnumerator.Current;
                    streamedSuccessfully = true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Groq streaming failed to start. Falling back to Ollama local.");
                if (groqEnumerator != null)
                {
                    await groqEnumerator.DisposeAsync();
                    groqEnumerator = null;
                }
            }
        }

        if (streamedSuccessfully && groqEnumerator != null)
        {
            yield return firstChunk!;
            try
            {
                while (await groqEnumerator.MoveNextAsync())
                {
                    yield return groqEnumerator.Current;
                }
            }
            finally
            {
                await groqEnumerator.DisposeAsync();
            }
        }
        else
        {
            await foreach (var chunk in StreamOllama(systemPrompt, userPrompt))
            {
                yield return chunk;
            }
        }
    }

    #endregion

    #region Helper Functions

    private async Task<(List<ProductEntity> topMatches, float[] queryVector)?> GetRelatedMatches(string question)
    {
        var queryVector = await _embeddingService.GetEmbedding(question);

        var products = await _dbContext.Products
            .Where(p => !p.IsDeleted && p.Embedding != null)
            .ToListAsync();

        var matchesWithDistance = products
            .Select(p => new
            {
                Product = p,
                Distance = CalculateCosineDistance(p.Embedding!.ToArray(), queryVector)
            })
            .Where(x => x.Distance <= _threshold)
            .OrderBy(x => x.Distance)
            .Take(5)
            .ToList();

        if (matchesWithDistance.Count == 0)
        {
            return null;
        }

        var topMatches = matchesWithDistance.Select(x => x.Product).ToList();
        return (topMatches, queryVector);
    }

    private async Task<string> QueryOllama(string systemPrompt, string userPrompt)
    {
        var client = _httpClientFactory.CreateClient("RagChat.Ollama");
        var response = await client.PostAsJsonAsync("/api/chat", new
        {
            model = _ollamaChatModel,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            },
            stream = false
        });
        response.EnsureSuccessStatusCode();

        var ollamaResponse = await response.Content.ReadFromJsonAsync<OllamaChatResponse>();
        return ollamaResponse?.Message?.Content ?? "Tôi không nhận được phản hồi từ hệ thống tư vấn.";
    }

    private async Task<string> QueryGroq(string systemPrompt, string userPrompt)
    {
        var client = _httpClientFactory.CreateClient("RagChat.Groq");
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _groqApiKey);

        var response = await client.PostAsJsonAsync("/openai/v1/chat/completions", new
        {
            model = _groqModel,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            },
            stream = false
        });

        if (!response.IsSuccessStatusCode)
        {
            var errContent = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Groq API returned error status {response.StatusCode}. Response: {errContent}");
        }

        var groqResponse = await response.Content.ReadFromJsonAsync<GroqChatResponse>();
        return groqResponse?.Choices?.FirstOrDefault()?.Message?.Content
               ?? throw new Exception("Groq response did not contain message content.");
    }

    private async IAsyncEnumerable<string> StreamGroq(string systemPrompt, string userPrompt)
    {
        var client = _httpClientFactory.CreateClient("RagChat.Groq");
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _groqApiKey);

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "/openai/v1/chat/completions")
        {
            Content = JsonContent.Create(new
            {
                model = _groqModel,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                stream = true
            })
        };

        using var response = await client.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Groq Stream API returned {response.StatusCode}: {err}");
        }

        using var stream = await response.Content.ReadAsStreamAsync();
        using var reader = new StreamReader(stream, Encoding.UTF8);

        string? line;
        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            if (line.StartsWith("data: "))
            {
                var data = line.Substring(6).Trim();
                if (data == "[DONE]") break;

                GroqStreamResponse? chunk = null;
                try
                {
                    chunk = JsonSerializer.Deserialize<GroqStreamResponse>(data);
                }
                catch (JsonException)
                {
                    continue;
                }

                var content = chunk?.Choices?.FirstOrDefault()?.Delta?.Content;
                if (!string.IsNullOrEmpty(content))
                {
                    yield return content;
                }
            }
        }
    }

    private async IAsyncEnumerable<string> StreamOllama(string systemPrompt, string userPrompt)
    {
        var client = _httpClientFactory.CreateClient("RagChat.Ollama");

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/chat")
        {
            Content = JsonContent.Create(new
            {
                model = _ollamaChatModel,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                stream = true
            })
        };

        using var response = await client.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Ollama Stream API returned {response.StatusCode}: {err}");
        }

        using var stream = await response.Content.ReadAsStreamAsync();
        using var reader = new StreamReader(stream, Encoding.UTF8);

        string? line;
        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            OllamaStreamResponse? chunk = null;
            try
            {
                chunk = JsonSerializer.Deserialize<OllamaStreamResponse>(line);
            }
            catch (JsonException)
            {
                continue;
            }

            var content = chunk?.Message?.Content;
            if (!string.IsNullOrEmpty(content))
            {
                yield return content;
            }
        }
    }

    private double CalculateCosineDistance(float[] a, float[] b)
    {
        if (a.Length != b.Length) return 1.0;
        double dotProduct = 0;
        double mA = 0;
        double mB = 0;
        for (int i = 0; i < a.Length; i++)
        {
            dotProduct += a[i] * b[i];
            mA += a[i] * a[i];
            mB += b[i] * b[i];
        }
        if (mA == 0 || mB == 0) return 1.0;
        return 1.0 - (dotProduct / (Math.Sqrt(mA) * Math.Sqrt(mB)));
    }

    #endregion

    #region Record Structures

    private record OllamaChatResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("message")] MessageDetail Message
    );

    private record OllamaStreamResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("message")] MessageDetail Message
    );

    private record MessageDetail(
        [property: System.Text.Json.Serialization.JsonPropertyName("content")] string Content
    );

    private record GroqChatResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("choices")] List<GroqChoice>? Choices
    );

    private record GroqChoice(
        [property: System.Text.Json.Serialization.JsonPropertyName("message")] MessageDetail Message
    );

    private record GroqStreamResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("choices")] List<GroqStreamChoice>? Choices
    );

    private record GroqStreamChoice(
        [property: System.Text.Json.Serialization.JsonPropertyName("delta")] DeltaDetail Delta
    );

    private record DeltaDetail(
        [property: System.Text.Json.Serialization.JsonPropertyName("content")] string Content
    );

    #endregion
}
