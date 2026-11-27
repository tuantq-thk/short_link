# Changelog

Các thay đổi đáng chú ý của dự án được ghi tại đây.

## [0.1.0] - 2026-11-27

### Added
- Trang rút gọn link public, responsive, tiếng Việt, không cần tài khoản.
- Nhận URL HTTP/HTTPS từ mọi domain; validate định dạng và giới hạn 4.000 ký tự.
- Tạo mã ngẫu nhiên 7 ký tự với kiểm tra unique và retry khi va chạm.
- Redirect 302 trên Edge Runtime với CDN cache headers.
- API tạo link, thông báo lỗi dễ hiểu, rate limit best-effort 10 lần/phút/isolate.
- Nút sao chép một chạm, tạo link khác, trạng thái loading và accessibility cơ bản.
- Migration Supabase với RLS bật, không cấp quyền truy cập bảng trực tiếp cho client.
- README và tài liệu kiến trúc, deploy, chất lượng, capacity, security, roadmap.
- GitHub Actions CI kiểm tra TypeScript, ESLint và production build; Vercel Git Integration chịu trách nhiệm deploy khi push/PR.
- Chuyển landing page thành internal tools workspace, thêm Template Builder với Chatwork Task Report mặc định và custom templates lưu local.
- Thêm template storage mode `local`/`supabase`, migration `public.templates` và server CRUD API cho template dùng chung.
- Tái cấu trúc source theo feature, tách CSS Module cho từng tool và lazy-load Link tools/Templates để giảm initial route bundle.

