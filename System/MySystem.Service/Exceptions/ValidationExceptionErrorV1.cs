using System.Collections.Generic;

namespace MySystem.Service.Exceptions;

public class ValidationExceptionErrorV1 : AppException
{
    public IReadOnlyList<ValidationError> Errors { get; }

    public ValidationExceptionErrorV1(IReadOnlyList<ValidationError> errors)
        : base(title: "Unprocessable Entity", statusCode: 422, messageCode: "VALIDATION_ERROR", detail: "Validation failed")
    {
        Errors = errors;
    }
}