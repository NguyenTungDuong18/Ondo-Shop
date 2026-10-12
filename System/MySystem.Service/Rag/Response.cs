using System.Collections.Generic;
using ProductEntity = MySystem.Repository.Entities.Product;

namespace MySystem.Service.Rag;

public class Response
{
    public class AskResult
    {
        public string Answer { get; set; } = string.Empty;
        public List<ProductEntity> RelatedProducts { get; set; } = new();

        public AskResult() { }

        public AskResult(string answer, List<ProductEntity> relatedProducts)
        {
            Answer = answer;
            RelatedProducts = relatedProducts;
        }
    }
}
