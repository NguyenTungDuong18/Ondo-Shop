# MySystem frontend

React + TypeScript + Vite. Mã nguồn được chia theo các lớp Clean Architecture; giao diện được nhóm theo chức năng.

## Chạy dự án

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Trong PowerShell có thể dùng `Copy-Item .env.example .env.local`.
Đặt `VITE_API_BASE_URL` theo địa chỉ backend. Giá trị mặc định cho môi trường phát triển là `http://localhost:5000`.
Biến `VITE_*` được đưa vào bundle công khai, không đặt mật khẩu hay khóa bí mật ở đây.

## Cấu trúc

```text
src/
  app/                    # Khởi tạo dependency, provider và router
  domain/
    models/               # Kiểu dữ liệu và hợp đồng request/response
    repositories/         # Interface cho API, session và chat
    policies/             # Quy tắc thuần: giỏ hàng, phí vận chuyển
  application/
    services/             # Các thao tác qua repository được inject
    validation/           # Schema kiểm tra form
  infrastructure/
    repositories/         # HTTP adapter cho auth, sản phẩm, danh mục, đơn hàng
    http/                 # Axios, interceptor và chuẩn hóa lỗi
    auth/                 # Lưu token, đọc JWT, đồng bộ refresh
    chat/                 # SignalR và luồng dữ liệu AI
  presentation/
    features/<feature>/
      pages/              # Ghép controller hook với view
      hooks/              # State, event handler, điều phối thao tác của màn hình
      components/         # Render từ props, chia theo từng phần giao diện
      config/             # Nhãn, tùy chọn và mô tả field của chức năng
      types/              # Hợp đồng props dùng chung trong chức năng
    hooks/                # React Query hooks dùng chung giữa các chức năng
    state/                # Zustand adapters cho auth, cart, UI
    layout/               # Khung trang, navbar, sidebar, footer
    shared/components/    # Button, modal controls, pagination, loader…
  shared/
    config/               # Environment, phân trang, OTP, phí vận chuyển
    format/               # Định dạng tiền
  styles/                 # Theme và design tokens
```

Luồng chính: **Page → controller hook → application service → repository interface**.
`app/configureServices.ts` gắn HTTP/session/chat adapter vào các interface đó trước khi React render.
Domain không phụ thuộc React, Zustand, Axios hay trình duyệt.

Xem [ARCHITECTURE.md](./ARCHITECTURE.md) để biết quy tắc thêm chức năng và giới hạn của đợt refactor.

## Kiểm tra

```sh
npm run check:source
npm run check:architecture
npm run lint
npm test
npm run build
# Hoặc chạy tất cả:
npm run check
```

Test dùng Node test runner và TypeScript hiện có, không thêm dependency.
Test render dùng React SSR, fixture store và React Query cache; không gọi backend thật.
Sau khi sửa API hoặc luồng tương tác, cần kiểm tra thêm trên trình duyệt với backend đang chạy.

## Tách biệt FE và BE

`frontend/src` chỉ chứa source FE. BE là project riêng tại `../System/src`, có solution/build riêng. Các lớp domain/application/infrastructure ở đây đều thuộc FE; không import source .NET và không truy cập database trực tiếp. Hai bên giao tiếp qua HTTP API, SignalR và luồng AI, với địa chỉ backend lấy từ `VITE_API_BASE_URL`.

`npm run check:source` kiểm tra import không thoát khỏi FE/src, import bị thiếu và source/asset không được tham chiếu từ entrypoint (bao gồm lazy route và CSS import). Cập nhật entrypoint kiểm tra nếu sau này bổ sung worker hoặc entrypoint độc lập. `node_modules` là dependency cài đặt, còn `dist` và `.cache` được tạo lại khi build.
