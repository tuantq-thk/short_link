# Kiến trúc

## Thành phần

```text
Browser
  ├─ GET /             → Next.js static/SSR landing page
  ├─ POST /api/links   → Node.js function → validate → Supabase INSERT
  └─ GET /{code}       → Edge route → Supabase lookup on cache miss → 302
                                             ↓
                                      CDN cache (5 min)
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

Rate limiter map trong memory của isolate là best effort. Serverless có nhiều isolate, map có thể mất khi scale/redeploy, và header IP phụ thuộc proxy. Nó chỉ giúp chặn thao tác lặp đơn giản; không được xem là chống bot. Trước khi public rộng, thay bằng dịch vụ rate limit dùng chung hoặc WAF phù hợp.
