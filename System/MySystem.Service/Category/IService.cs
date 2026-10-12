using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MySystem.Service.Category;

public interface IService
{
    Task<List<Response.CategoryResponse>> GetCategories(bool activeOnly = false);
    Task<Response.CategoryResponse> GetCategoryById(Guid id);
    Task<Response.CategoryResponse> CreateCategory(Request.CreateCategoryRequest request);
    Task<Response.CategoryResponse> UpdateCategory(Guid id, Request.UpdateCategoryRequest request);
    Task<bool> DeleteCategory(Guid id);
}
