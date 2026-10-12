using System.Collections.Generic;
using System.Threading.Tasks;

namespace MySystem.Service.Rag;

public interface IRagService
{
    Task<Response.AskResult> AskQuestion(Request.AskRequest request);
    IAsyncEnumerable<string> AskQuestionStream(Request.AskRequest request);
    Task<int> ReindexAllProducts();
}
