# Chất lượng và kiểm tra MVP

## Tự động

```bash
npm run typecheck
npm run lint
npm run build
```

## Luồng kiểm tra thủ công

1. Submit trống: nút bị disabled.
2. Submit text không phải URL: hiển thị lỗi rõ ràng, không tạo record.
3. Submit `javascript:`/`data:`: server từ chối.
4. Submit URL dài hơn giới hạn: từ chối.
5. Submit URL hợp lệ với query/hash unicode: tạo link rồi redirect tới đúng URL.
6. Nhấp nhanh quá 10 lần/phút trong cùng isolate: nhận HTTP 429 và `Retry-After`.
7. Clipboard thành công: trạng thái “Đã sao chép”; tạo link khác hoạt động.
8. Mã ngẫu nhiên không có trong DB: 404.
9. Viewport điện thoại 320–390px: không tràn ngang; form và CTA sử dụng được.
10. Keyboard: tab tới input/nút, focus dễ nhìn, thông báo lỗi đọc được.

## Load check đề xuất trước khi công khai rộng

Dùng k6 hoặc công cụ tương đương trên deployment staging, không chạy bài tải lớn lên project production Free mà chưa theo dõi quota. Tạo trước nhiều short links để đo redirect riêng; sau đó đo POST create ở kịch bản thấp hơn. Theo dõi p50/p95/p99, 3xx/4xx/5xx, Vercel invocation, Supabase CPU/connections/egress. Mục tiêu ban đầu: burst 10 RPS trong 5 phút, kiểm tra lỗi và p95; đây là tiêu chí kiểm thử, không phải SLA.
