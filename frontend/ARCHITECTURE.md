# Quy ước kiến trúc frontend

## Chiều phụ thuộc

- `domain`: model, repository interface, hàm nghiệp vụ thuần. Không import lớp khác hoặc thư viện giao diện.
- `application`: phụ thuộc `domain`; hiện cho phép Zod để định nghĩa validation. Không truy cập DOM, localStorage, HTTP hay React.
- `infrastructure`: triển khai repository interface; được dùng `domain` và cấu hình `shared`.
- `presentation`: dùng application service và model/policy; không import adapter trong infrastructure, không gọi fetch trực tiếp.
- `app`: composition root, được kết nối các lớp và khởi tạo router/provider.
- `shared`: helper/cấu hình độc lập; không import feature hay lớp nghiệp vụ.

`npm run check:architecture` kiểm tra các import/export tĩnh tương đối và truy cập browser/transport không phù hợp. Đây là kiểm tra ranh giới cơ bản, không thay thế code review; dynamic import và cách truy cập gián tiếp vẫn cần được xem xét.

## Thêm một chức năng

1. Định nghĩa model và repository interface trong `domain` nếu có dữ liệu/nghiệp vụ mới.
2. Đặt phép tính và quy tắc thuần trong `domain/policies`; đặt validation trong `application/validation`.
3. Viết adapter trong `infrastructure` và đăng ký tại `app/configureServices.ts`. Application service chỉ biết interface; có thể thay adapter bằng fake khi test.
4. Đặt controller hook trong `presentation/features/<feature>/hooks`. Hook quản lý state, gọi query/mutation và xử lý sự kiện.
5. Page chỉ gọi hook và truyền model cho view. View xử lý nhánh loading/error/empty và ghép các component nhỏ có props rõ ràng.
6. Component dùng lại giữa nhiều chức năng đặt trong `presentation/shared/components`. Component quản lý tồn kho thuộc `inventory`, component mua sắm thuộc `catalog`.
7. Thêm route lazy-load và kiểm tra build, lint, ranh giới import cùng các test phù hợp.

Không đưa API URL, ngưỡng miễn phí giao hàng, schema form hoặc logic cập nhật giỏ hàng vào JSX. Nội dung tĩnh và class/style vẫn thuộc presentation; nhãn/tùy chọn lặp lại đặt trong config của feature.

## Dependency injection

Các service hiện dùng một registry cho một ứng dụng SPA. `configure*Repository` được gọi một lần ở composition root; factory `create*UseCases` cho phép kiểm tra CRUD với adapter riêng. Không cấu hình lại registry trong component hoặc trong quá trình render.

Đây chưa phải container dành cho SSR nhiều người dùng. Nếu triển khai SSR, thay registry và Zustand singleton bằng instance/context theo từng request để không chia sẻ session giữa người dùng. Các test render hiện chỉ kiểm tra composition của giao diện, không biến ứng dụng thành SSR.

## Những phần đã thay đổi

- Di chuyển toàn bộ source vào các lớp mới; tách 14 page, trong đó trang 404 chỉ có giao diện nên không cần controller riêng.
- Tách navbar, giỏ hàng, form sản phẩm, product card và chat thành controller/view; chia tiếp các khối giao diện thành component có tên theo chức năng.
- Tập trung validation, định dạng tiền, config OTP/phân trang/phí giao hàng và hợp đồng repository.
- Tách SignalR, xử lý luồng AI, token storage và HTTP interceptor khỏi component/hook.
- Loại bỏ vòng phụ thuộc Axios → auth store → auth service → Axios.
- Refresh token dùng chung một promise; cả thành công và thất bại đều giải phóng các request chờ. Refresh có timeout 10 giây.
- Luồng AI xử lý phần dữ liệu cuối không có newline và hủy request khi component unmount.
- Giỏ hàng giới hạn số lượng theo tồn kho cho cả lần thêm đầu tiên; thao tác logout không gọi API hai lần.
- Đồng bộ ô tìm kiếm khi dùng lịch sử trình duyệt; giải phóng URL tạm của ảnh đại diện; sửa dependency của form sản phẩm.
- Bỏ tài khoản/mật khẩu demo điền sẵn và hiển thị trên trang login. Dashboard hiển thị địa chỉ API từ config, không khẳng định backend khỏe khi chưa kiểm tra.
- Route tải theo nhu cầu; loại bỏ asset/CSS scaffold Vite không được dùng.

## Phạm vi kiểm chứng và phần giữ nguyên

Test bao gồm quy tắc giỏ hàng/phí vận chuyển, validation, refresh đồng thời/thất bại, parser luồng AI, render 14 màn hình và các nhánh có/không có dữ liệu. Build kiểm tra toàn bộ TypeScript và bundle production. Các test render dùng fixture, không kiểm tra thao tác DOM, cookie thật, email OTP hay kết nối SignalR thật.

Backend và hợp đồng endpoint không đổi. Phí giao hàng ở frontend là giá trị hiển thị theo config; backend vẫn quyết định số tiền thực của đơn hàng. OTP phía client chỉ điều khiển giao diện, backend vẫn chịu trách nhiệm xác thực/rate limit.

Luồng profile hiện lưu họ tên, email, số điện thoại và ngày sinh qua JSON. FE chỉ gửi multipart đến API avatar khi có file mới sau khi căn ảnh trong khung vuông có lưới 3×3 và vòng tròn nội tiếp. Adapter lưu thông tin trước rồi thay avatar; BE tự lấy publicId cũ theo tài khoản. Object URL dùng cho xem trước và được thu hồi khi thay ảnh/hủy/unmount. Xem chi tiết và hành vi khi lỗi trong `System/src/CLOUDINARY_RAG.md`. Dashboard vẫn tính một số thống kê từ tối đa 50 sản phẩm như trước, không phải thống kê toàn bộ kho. Route guard vẫn theo hành vi đăng nhập hiện có; phân quyền thực phải được backend kiểm tra. Các nội dung tiếng Việt vốn bị lỗi encoding chưa được sửa hàng loạt để tránh thay đổi ngoài phạm vi kiến trúc.
