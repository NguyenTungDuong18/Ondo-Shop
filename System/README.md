# MySystem Backend (BE)

Thư mục `System` là project backend .NET độc lập. Source backend nằm hoàn toàn trong `System/src`; source frontend nằm riêng trong `../frontend/src`.

```text
My System/
  System/                         # BE project root
    MySystem.slnx
    src/
      MySystem.API/               # HTTP API, middleware, cấu hình host
      MySystem.Service/           # Nghiệp vụ và SignalR hub
      MySystem.Repository/        # Entity, EF Core, migration
    scripts/check-boundaries.ps1
  frontend/                       # FE project root
    package.json
    src/                          # React/TypeScript, chỉ chạy phía FE
```

Hai bên không import source của nhau, không dùng chung thư mục build và không có project reference chéo. Các lớp `domain`, `application`, `infrastructure` bên FE đều là code TypeScript phía trình duyệt, không phải source BE.

## Chạy BE

Từ thư mục `System`:

```powershell
dotnet build MySystem.slnx
dotnet run --project src/MySystem.API/MySystem.API.csproj --launch-profile http
```

Cấu hình database, JWT, Redis, mail và Ollama theo các key backend đang đọc, qua biến môi trường hoặc file cấu hình cục bộ tại `src/MySystem.API`. Việc đổi vị trí source không tạo lại hay thay đổi các cấu hình bí mật.

## Giao tiếp với FE

- BE HTTP mặc định: `http://localhost:5000`.
- FE dev mặc định: `http://localhost:5173`.
- FE chọn BE bằng `VITE_API_BASE_URL` trong `frontend/.env.local`.
- API REST: `/api/v1/...`; SignalR: `/hubs/chat`; luồng AI: `/api/v1/RagChat/AskStream`.
- CORS/cookie được xử lý ở BE. Khi thay domain triển khai, cấu hình origin ở BE và API URL ở FE cho phù hợp.
- Backend quyết định xác thực, phân quyền, validation nghiệp vụ và số tiền đơn hàng. Kiểm tra/hiển thị bên FE không thay thế các quy tắc này.

## Kiểm tra

```powershell
./scripts/check-boundaries.ps1
dotnet build MySystem.slnx
```

FE có bộ kiểm tra riêng: chạy `npm run check` trong `../frontend`.

`bin/`, `obj/` là output có thể tạo lại khi build, không phải source. Không đưa `node_modules`, `dist` hoặc source FE vào solution BE. Migration được giữ vì đó là lịch sử schema cần thiết, kể cả migration có tên `test`.
