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
11. Bulk: thêm 2 hàng gồm label tùy chọn và URL, tạo đủ 2 link, copy report và tải được file `.txt` với mỗi dòng `label : short-link`.
12. Bulk lỗi một phần: dòng URL sai hiển thị lỗi, các dòng hợp lệ vẫn có trong report; lỗi insert giữa batch không làm mất các kết quả đã tạo.
13. Template: chọn Chatwork Task Report, điền các placeholder, preview giữ đúng `[info][title]...[/title]...[/info]`, copy ra text đúng nội dung.
14. Template CRUD: tạo template mới bằng `{{placeholder}}`, lưu, chọn lại, sửa, xóa; reload trang vẫn giữ template custom trong cùng trình duyệt.
15. Template security: giá trị chứa `[info]`, HTML hoặc ký tự đặc biệt chỉ xuất hiện như text preview, không được render thành HTML.
16. Template switching: nhập giá trị ở template A, chuyển sang template B có placeholder trùng tên; B không được tự kế thừa giá trị của A.
17. Mobile header: ở viewport 320–390px vẫn nhìn thấy badge `INTERNAL TOOLKIT`, menu không che logo và có thể cuộn ngang nếu cần.

## Load check đề xuất trước khi công khai rộng

Dùng k6 hoặc công cụ tương đương trên deployment staging, không chạy bài tải lớn lên project production Free mà chưa theo dõi quota. Tạo trước nhiều short links để đo redirect riêng; sau đó đo POST create ở kịch bản thấp hơn. Theo dõi p50/p95/p99, 3xx/4xx/5xx, Vercel invocation, Supabase CPU/connections/egress. Mục tiêu ban đầu: burst 10 RPS trong 5 phút, kiểm tra lỗi và p95; đây là tiêu chí kiểm thử, không phải SLA.
