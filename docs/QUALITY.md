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
13. Template: lần lượt chọn đủ 5 mẫu Chatwork built-in, điền các placeholder, preview giữ đúng `[info][title]...[/title]...[/info]`, copy ra text đúng nội dung.
14. Template CRUD: tạo template mới bằng `{{placeholder}}`, lưu, chọn lại, sửa, xóa; reload trang vẫn giữ template custom trong cùng trình duyệt.
15. Template security: giá trị chứa `[info]`, HTML hoặc ký tự đặc biệt chỉ xuất hiện như text preview, không được render thành HTML.
16. Template switching: nhập giá trị ở template A, chuyển sang template B có placeholder trùng tên; B không được tự kế thừa giá trị của A.
17. Storage mode `local`: tạo/sửa/xóa template, reload vẫn giữ definition trong browser; values report không được giữ lại.
18. Storage mode `supabase`: chạy migration, set env mode, reload ở browser khác vẫn thấy template custom; create/update/delete đi qua `/api/templates`.
19. Template library: nhiều template được chọn bằng dropdown; import một object hoặc array JSON hợp lệ sẽ thêm template và chọn template đầu tiên vừa import; export tạo được JSON của template hiện tại.
20. Template modes: mode `Nhập giá trị` mặc định ở cột trái, mode `Template details` chỉnh nội dung ở cùng cột, Preview cố định ở cột phải.
21. Template actions: Import/Export/Save/Delete/Copy có icon phía trước; action thành công hiển thị text feedback và `Copy text` đổi trạng thái sau khi copy.
22. Mobile header: ở viewport 320–390px vẫn nhìn thấy badge `INTERNAL TOOLKIT`, menu không che logo và có thể cuộn ngang nếu cần.

## Load check đề xuất trước khi công khai rộng

Dùng k6 hoặc công cụ tương đương trên deployment staging, không chạy bài tải lớn lên project production Free mà chưa theo dõi quota. Tạo trước nhiều short links để đo redirect riêng; sau đó đo POST create ở kịch bản thấp hơn. Theo dõi p50/p95/p99, 3xx/4xx/5xx, Vercel invocation, Supabase CPU/connections/egress. Mục tiêu ban đầu: burst 10 RPS trong 5 phút, kiểm tra lỗi và p95; đây là tiêu chí kiểm thử, không phải SLA.
