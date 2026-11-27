# Kiến trúc

## Thành phần

```text
Browser
  ├─ GET /             → server shell → client workspace → tool catalog
  │                                  ├─ dynamic Link tools chunk + feature CSS
  │                                  └─ dynamic Templates chunk + feature CSS
  ├─ POST /api/links   → Node.js function → validate → Supabase INSERT
  ├─ POST /api/links/bulk → Node.js function → per-item validate/create → partial report
  ├─ /api/templates    → Node.js function → service role → public.templates (supabase mode)
  └─ GET /{code}       → Edge route → Supabase lookup on cache miss → 302
                                             ↓
                                      CDN cache (5 min)

Link tool giữ hai flow single/bulk. Template Builder có hai adapter lưu trữ được chọn bằng `NEXT_PUBLIC_TEMPLATE_STORAGE_MODE`: local mode lưu template definitions trong localStorage; supabase mode dùng `/api/templates` và bảng `public.templates` qua service role. Values chỉ sống trong React state của phiên hiện tại; rendered text không gửi lên server. Khi chuyển template, values được reset theo template mới để tránh rò dữ liệu giữa các report. Template API chưa có authentication và chỉ phù hợp cho internal deployment.

Mã giao diện được tổ chức theo feature: `workspace`, `links` và `templates` có module riêng cho implementation, logic và CSS. `globals.css` chỉ chứa design tokens, reset và accessibility baseline. Workspace dùng dynamic import để không tải implementation/CSS của Link tools và Templates trong initial route chunk; các feature được nạp khi người dùng mở tool tương ứng.

Workspace dùng app shell cao bằng `100dvh`: header và footer là các vùng flex cố định, còn `main` là vùng scroll độc lập. Các tool đã mở được giữ mounted và ẩn/hiện bằng panel để giữ form state, tránh fetch/render lại khi đổi tab; scroll của vùng content được reset về đầu mỗi lần chuyển tool.
```

## Dữ liệu

`public.links` giữ `id`, `code`, `destination_url`, `created_at`. `code` có unique constraint và index; URL đích không cần index. Click không được ghi vào database để redirect nhẹ và tránh tăng write load.

## Mã ngắn

7 ký tự từ alphabet bỏ `0`, `1`, `i`, `l`, `o` để giảm nhầm lẫn. Với alphabet 30 ký tự, không gian mã là 30^7, khoảng 21,9 tỷ khả năng. Unique constraint ở Postgres là nguồn đảm bảo cuối cùng; khi collision, API thử tối đa 3 lần.

## Redirect/cache

Route động ở Edge Runtime, trả `302` và `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`. Cache giúp giảm DB reads khi link được truy cập lặp. Các URL gần như duy nhất sẽ không có cache hit. Nếu sau này cần vô hiệu hóa link ngay lập tức, giảm TTL hoặc chuyển sang cache tag/invalidation; hiện tại chưa có chức năng sửa/gỡ link.

## Tại sao không dùng client trực tiếp tới Supabase?

Chỉ server route được giữ service role. Bảng bật RLS và không có quyền anon/authenticated. Điều này giảm bề mặt API và tránh để secret trong bundle browser.

## Rate limit

Rate limiter map trong memory của isolate là best effort. Serverless có nhiều isolate, map có thể mất khi scale/redeploy, và header IP phụ thuộc proxy. Single create tính 1 lượt; bulk tính theo số item trong request và tối đa 10 item. Nó chỉ giúp chặn thao tác lặp đơn giản; không được xem là chống bot. Trước khi public rộng, thay bằng dịch vụ rate limit dùng chung hoặc WAF phù hợp.
