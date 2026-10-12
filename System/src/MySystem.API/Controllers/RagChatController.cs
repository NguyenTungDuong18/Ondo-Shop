using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MySystem.Service.Models;
using MySystem.Service.Rag;

namespace MySystem.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class RagChatController : ControllerBase
{
    private readonly IRagService _ragService;

    public RagChatController(IRagService ragService)
    {
        _ragService = ragService;
    }

    [HttpPost("Ask")]
    public async Task<IActionResult> Ask([FromBody] Request.AskRequest request)
    {
        var result = await _ragService.AskQuestion(request);
        return Ok(ApiResponseFactory.Base(result, message: "Nhận câu trả lời tư vấn thành công"));
    }

    [HttpPost("AskStream")]
    [Produces("text/event-stream")]
    public async Task AskStream([FromBody] Request.AskRequest request)
    {
        Response.ContentType = "text/event-stream";
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");

        var cancellationToken = HttpContext.RequestAborted;
        try
        {
            await foreach (var chunk in _ragService.AskQuestionStream(request))
            {
                if (cancellationToken.IsCancellationRequested) break;
                await Response.WriteAsync($"data: {chunk}\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }
        }
        catch (OperationCanceledException) { }
    }
}
