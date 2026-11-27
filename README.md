# Link Gọn

Dịch vụ rút gọn đường dẫn public, không cần tài khoản. Dán URL, tạo mã ngắn, sao chép và chia sẻ.

## Tính năng MVP

- Nhận URL `http://` và `https://` từ mọi domain.
- Tạo mã ngẫu nhiên 7 ký tự, tránh các ký tự dễ nhầm lẫn.
- Redirect HTTP 302 đến URL đích; cache redirect ở CDN tối đa 5 phút.
- Sao chép link bằng một chạm, tạo link tiếp theo, thông báo lỗi tiếng Việt.
- Responsive, accessible, landing page server-rendered; chỉ form dùng JavaScript phía client.
- Không đăng nhập, không analytics click, không lưu IP.
- Rate limit tạo link best-effort theo IP: 10 lần/phút trên mỗi Vercel function isolate.

## Stack

- Next.js 15 App Router, React 19, TypeScript.
- Vercel Functions và Edge Runtime.
- Supabase Postgres; một bảng `links`, RLS bật, không cấp quyền bảng cho client anon/authenticated.

## Cấu trúc

```text
src/
  app/
    [code]/route.ts       # Edge redirect handler
    api/links/route.ts    # Tạo link, validate và rate limit
    globals.css           # CSS responsive, không thêm UI framework
    layout.tsx            # Metadata và root layout
    page.tsx              # Trang landing server-rendered
  components/
    link-shortener.tsx    # Form tương tác client-side
  lib/
    code.ts               # Sinh mã ngắn
    constants.ts          # Giới hạn dùng chung
    http.ts               # Đọc IP từ request
    rate-limit.ts         # Throttle best-effort
    supabase/admin.ts     # Supabase server-only client
    url.ts                # Chuẩn hóa/kiểm tra URL
supabase/migrations/      # Schema SQL
 docs/                    # Tài liệu thiết kế, deploy, bảo mật, vận hành
```

## Chạy local

Yêu cầu Node.js 20.9+ và npm.

```bash
npm install
cp .env.example .env.local
```

Điền `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` và `NEXT_PUBLIC_APP_URL=http://localhost:3000` vào `.env.local`.

Tạo project Supabase, mở SQL Editor, chạy nội dung `supabase/migrations/202611270001_create_links.sql`, sau đó:

```bash
npm run dev
```

Mở <http://localhost:3000>.

## Deploy miễn phí ban đầu

1. Đẩy repository lên GitHub.
2. Tạo project Supabase Free và chạy migration SQL ở trên.
3. Import repo vào Vercel. Gói Hobby chỉ phù hợp cho dự án cá nhân, phi thương mại; hãy xác nhận điều khoản hiện hành nếu dùng trong tổ chức/công ty.
4. Thêm Environment Variables cho Production (và Preview nếu cần):
   - `SUPABASE_URL`: Project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: service role secret; tuyệt đối không đặt tiền tố `NEXT_PUBLIC_`.
   - `NEXT_PUBLIC_APP_URL`: URL canonical, ví dụ `https://link-gon.vercel.app`.
5. Deploy. Smoke check trang chủ, tạo link, mở redirect, mã sai và URL sai.

Đọc [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) để biết từng bước, cấu hình GitHub Actions và kiểm tra sau deploy.

## Commands

```bash
npm run dev       # local development
npm run typecheck # TypeScript validation
npm run lint      # ESLint
npm run build     # production build
npm start         # serve built app locally
```

## Tải và giới hạn vận hành

Mức 10 redirect requests/giây là tải nhỏ về xử lý ứng dụng. Redirect route trả `302` với CDN caching; cùng một mã được mở nhiều lần có thể được phục vụ từ cache. Lượt tạo link luôn ghi một hàng vào Postgres.

Tuy nhiên, không có cam kết tải bền vững hay uptime trên free tiers. Vercel Hobby công bố tối đa 1 triệu function invocations/tháng, còn Supabase Free có quota và có thể pause sau một tuần ít hoạt động. 10 lượt/giây liên tục là khoảng 25,9 triệu lượt/tháng; không nên kỳ vọng free tier đáp ứng cả tháng. Hãy xem [docs/CAPACITY.md](docs/CAPACITY.md) trước khi chia sẻ rộng.

Rate limiter hiện ở memory của từng function isolate nên là lớp giảm spam nhẹ, **không phải** quota toàn cục/chống bot đáng tin cậy. Nếu dịch vụ được dùng công khai rộng, cần shared rate limiter/WAF, abuse reporting, và phương án vận hành có ngân sách.

## Bảo mật và quyền riêng tư

- Link công khai: bất kỳ ai biết mã đều có thể mở và chuyển hướng.
- URL đích có thể chứa dữ liệu nhạy cảm; chỉ rút gọn URL mà bạn có quyền chia sẻ.
- API không đọc link đích từ client khi redirect; nó chỉ tra cứu theo mã.
- Service role key chỉ dùng ở server.
- Có thể bị lạm dụng để che giấu lừa đảo. MVP không xác minh nội dung URL, chưa có báo cáo/gỡ link hay hệ thống chống spam mạnh.
- Không lưu IP và không ghi click analytics. Platform logs có thể có metadata vận hành theo chính sách của nhà cung cấp.

## Tài liệu

- [Kiến trúc và quyết định](docs/ARCHITECTURE.md)
- [Deploy và cấu hình Supabase/Vercel](docs/DEPLOYMENT.md)
- [Kiểm thử và kiểm tra thủ công](docs/QUALITY.md)
- [Tải, quota và giới hạn free](docs/CAPACITY.md)
- [Bảo mật, lạm dụng và quyền riêng tư](docs/SECURITY.md)
- [Changelog](CHANGELOG.md)
- [Kế hoạch phát triển](docs/ROADMAP.md)
