# Upload, xóa ảnh Cloudinary và cấu hình RAG AI

Các section `CloudinaryOptions`, `Ollama`, `Groq` nằm chung trong
`MySystem.API/appsettings.json` hiện tại, cùng cấu hình database, JWT và mail.
Chỉnh trực tiếp các giá trị trong file này theo môi trường chạy.

## Cấu hình Cloudinary

Điền `CloudName`, `ApiKey`, `ApiSecret` của tài khoản Cloudinary trong
`CloudinaryOptions`, hoặc đặt các biến môi trường tương ứng:

```powershell
$env:CloudinaryOptions__CloudName = '<cloud-name>'
$env:CloudinaryOptions__ApiKey = '<api-key>'
$env:CloudinaryOptions__ApiSecret = '<api-secret>'
```

`Folder` mặc định là `mysystem`. Ứng dụng vẫn khởi động được khi chưa cấu hình
Cloudinary; yêu cầu upload/xóa trả mã lỗi `CLOUDINARY_NOT_CONFIGURED` khi thiếu thông tin.

## API upload

`POST /api/v1/Media/upload-image`

- Cần đăng nhập; dùng Bearer access token hoặc cookie `accessToken` hiện có.
- Body là `multipart/form-data`, trường file tên `file`.
- Hỗ trợ JPG, JPEG, PNG, GIF, WEBP, tối đa 5 MiB mỗi ảnh.
- Kiểm tra phần mở rộng, MIME type và chữ ký định dạng file trước khi upload.
- Tên ảnh trên Cloudinary dùng ID ngẫu nhiên và không ghi đè ảnh có sẵn.

Ví dụ (thay URL và token theo môi trường):

```powershell
curl.exe -X POST 'http://localhost:5000/api/v1/Media/upload-image' `
  -H 'Authorization: Bearer <access-token>' `
  -F 'file=@C:/images/product.png;type=image/png'
```

Phần `data` của response thành công:

```json
{
  "url": "https://res.cloudinary.com/<cloud-name>/image/upload/.../mysystem/<id>.png",
  "publicId": "mysystem/<id>"
}
```

Dùng `data.url` cho `imageUrl` trong API tạo/cập nhật sản phẩm.
Avatar dùng API riêng `PUT /api/v1/Auth/me/avatar` để BE tự quản lý ảnh cũ và lưu URL/publicId.
File rỗng/sai định dạng/quá dung lượng trả 400. Request vượt giới hạn multipart
có thể bị server từ chối với 413 hoặc lỗi model binding trước khi vào service.

## API xóa ảnh

`DELETE /api/v1/Media/delete-image`

Cần đăng nhập với quyền `Admin`, giống các API xóa sản phẩm hiện tại.
Body JSON chứa `publicId` lấy từ `data.publicId` của API upload, bao gồm cả
thư mục và không thêm đuôi định dạng ảnh:

```json
{
  "publicId": "mysystem/<id>"
}
```

Ví dụ gọi bằng PowerShell:

```powershell
Invoke-RestMethod -Method Delete `
  -Uri 'http://localhost:5000/api/v1/Media/delete-image' `
  -Headers @{ Authorization = 'Bearer <admin-access-token>' } `
  -ContentType 'application/json' `
  -Body '{"publicId":"mysystem/<id>"}'
```

Thành công trả 200 với `success: true`, `data.publicId` và thông báo xóa ảnh.
Thiếu publicId trả 400; ảnh không tồn tại trả 404 với mã
`CLOUDINARY_IMAGE_NOT_FOUND`; Cloudinary báo lỗi trả 500 với mã
`CLOUDINARY_DELETE_FAILED`.

Service gọi `DestroyAsync` với `ResourceType.Image`, `Type = "upload"` và
`Invalidate = true` để yêu cầu xóa cache CDN theo
[tài liệu Cloudinary](https://cloudinary.com/documentation/image_upload_api_reference#destroy_method).
API xóa ảnh trên Cloudinary; URL đang lưu trong sản phẩm/hồ sơ cần được cập nhật
qua API của sản phẩm/hồ sơ tương ứng.

## Hồ sơ và thay avatar

`PUT /api/v1/Auth/me` nhận JSON `fullName`, `email`, `phoneNumber` (nullable),
`dateOfBirth` (nullable, `yyyy-MM-dd`). Ngày sinh không được ở tương lai.
Endpoint này giữ nguyên avatar; không nhận URL ảnh để tránh bỏ qua quy trình quản lý ảnh.

`PUT /api/v1/Auth/me/avatar` yêu cầu đăng nhập, nhận multipart với duy nhất trường `file`,
cùng giới hạn và kiểm tra định dạng như API upload. Không nhận userId hay publicId từ FE.
BE lấy tài khoản từ JWT, đọc `AvatarPublicId` trong database, xóa ảnh cũ qua media service,
tải ảnh mới qua media service, rồi lưu cả `AvatarUrl` và `AvatarPublicId`. Các lần thay ảnh
cùng tài khoản được tuần tự hóa bằng row lock PostgreSQL. Ảnh cũ đã bị xóa trên Cloudinary
không ngăn việc tải ảnh mới. Avatar ngoài Cloudinary được thay URL mà không gọi xóa tài nguyên ngoài.
Avatar Cloudinary cũ chỉ có URL được suy ra publicId từ URL upload của cloud đã cấu hình.

FE chỉ gọi API avatar khi người dùng chọn và xác nhận ảnh mới. Nhấn avatar navbar mở `/profile`;
chọn ảnh mở khung vuông 1:1, lưới 3×3 và đường tròn nội tiếp. Người dùng kéo hoặc dùng phím mũi tên,
phóng to từ 1–3 lần; ảnh được xuất PNG 512×512. Hủy không tải ảnh lên. `Save changes` lưu thông tin
cá nhân trước, rồi mới thay avatar, sau đó đồng bộ avatar navbar từ response.

Theo thứ tự **xóa trước, tải sau**, nếu upload lỗi thì ảnh cũ đã mất. BE xóa URL/publicId cũ khỏi
database để không giữ liên kết hỏng; FE giữ ảnh đã căn để thử lại và tải lại trạng thái hồ sơ.
Nếu việc thay ảnh thất bại, thông tin cá nhân có thể đã được lưu thành công.

Model thêm `DateOfBirth` (`date`) và `AvatarPublicId` (`text`) nullable. Migration `AddProfileDetails`
được cung cấp cho quy trình EF; startup cũng thêm hai cột bằng `ADD COLUMN IF NOT EXISTS` để tương thích
database cũ dùng `EnsureCreated`. Không tự áp dụng toàn bộ lịch sử migration lên database kiểu này.

Kiểm tra: `npm run check` trong `frontend` và
`dotnet run --project System/src/tests/MediaRagChecks` từ workspace. Bộ kiểm tra mô phỏng Cloudinary;
không upload hoặc xóa ảnh thật. UI chưa được kiểm tra thao tác trực tiếp trong trình duyệt.

## Cấu hình RAG

`Ollama` được dùng để tạo embedding và trả lời bằng mô hình local:

```json
{
  "Ollama": {
    "BaseUrl": "http://localhost:11434",
    "EmbeddingModel": "nomic-embed-text",
    "ChatModel": "qwen3:8b",
    "SimilarityThreshold": 0.5
  },
  "Groq": {
    "BaseUrl": "https://api.groq.com",
    "ApiKey": "",
    "Model": "llama-3.3-70b-versatile"
  }
}
```

Chuẩn bị Ollama và tải đúng các mô hình đã cấu hình:

```powershell
ollama pull nomic-embed-text
ollama pull qwen3:8b
```

Ollama cần đang chạy tại `Ollama:BaseUrl`. Nếu chạy API bằng Docker, địa chỉ này
phải trỏ tới Ollama từ bên trong container. PostgreSQL cần sẵn sàng cho bước lập chỉ mục.

Để dùng Groq cho bước sinh câu trả lời, đặt `Groq:ApiKey` hoặc:

```powershell
$env:Groq__ApiKey = '<groq-api-key>'
```

Khi khóa Groq để trống, service dùng Ollama. Khi có khóa, service ưu tiên Groq
và chuyển sang Ollama nếu gọi Groq thất bại (với stream, fallback xảy ra trước
khi nhận chunk đầu tiên). Embedding vẫn luôn dùng Ollama.
Đường dẫn Groq đã được sửa cho cả chat thường và stream thành
`/openai/v1/chat/completions` theo [tài liệu Groq](https://console.groq.com/docs/openai).

`SimilarityThreshold` là ngưỡng **khoảng cách cosine**: giá trị nhỏ hơn lọc chặt hơn.
Sau khi thay mô hình embedding, lập chỉ mục lại toàn bộ sản phẩm để các vector
được tạo bằng cùng mô hình.

Thứ tự kiểm tra:

1. Gọi `POST /api/v1/RagAdmin/ReindexProducts` để tạo embedding cho sản phẩm.
2. Gọi `POST /api/v1/RagChat/Ask` với body `{"question":"Tư vấn sản phẩm phù hợp"}`.
3. Dùng `POST /api/v1/RagChat/AskStream` với cùng body để nhận SSE.

Upload sử dụng [Cloudinary .NET SDK](https://cloudinary.com/documentation/dotnet_image_and_video_upload)
phiên bản 1.28.0, giống dự án TetPee.

## Kiểm tra

Chạy từ thư mục `System/src`:

```powershell
dotnet build MySystem.API/MySystem.API.csproj -c Release
dotnet run --project tests/MediaRagChecks -c Release
```

Bộ kiểm tra chạy HTTP server tạm trên loopback với controller và service upload
thật, mô phỏng Cloudinary ở ranh giới SDK. Các trường hợp gồm xác thực, binding
multipart, URL trả về, file rỗng/sai định dạng/giả ảnh/quá dung lượng, lỗi provider,
ID ảnh riêng biệt, publicId trả về và schema Swagger. Kiểm tra API xóa gồm quyền
Admin, publicId rỗng, xóa thành công, yêu cầu xóa cache CDN, ảnh không tồn tại
và lỗi provider. Hai luồng RAG dùng database InMemory và
HTTP handler mô phỏng để kiểm tra endpoint Groq, khóa API, model và đọc SSE.
Không upload/xóa ảnh hay gọi AI ra dịch vụ bên ngoài trong các kiểm tra này.
