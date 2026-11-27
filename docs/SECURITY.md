# Bảo mật, lạm dụng và quyền riêng tư

## URL scheme

App cho phép mọi host nhưng chỉ `http:` và `https:`; từ chối `javascript:`, `data:`, `file:` và scheme khác để giảm nguy cơ thực thi nội dung thay vì điều hướng web. `new URL()` chuẩn hóa URL trước khi ghi.

## Open redirect là sản phẩm

Dịch vụ này được thiết kế để chuyển hướng public tới URL do người dùng gửi. Điều đó có thể bị dùng để che giấu link lừa đảo hoặc spam. Bản MVP chưa có moderation, report endpoint, blacklist, quét reputational feed, hay gỡ link qua admin. Không dùng nó như lớp bảo vệ link.

## Secrets và database

- Service role chỉ được đọc trong server-only module.
- Template definitions được lưu trong `localStorage` của trình duyệt; giá trị report chỉ nằm trong React state của phiên hiện tại và không gửi lên server. Không lưu secret, token hoặc dữ liệu nhạy cảm trong template/value.
- RLS bật và revoke bảng khỏi `anon`/`authenticated`.
- Không log destination URL hoặc IP.
- Bảo vệ Vercel/Supabase dashboards bằng MFA; rotate key nếu từng lộ.

## Abuse controls MVP

- Validate protocol/độ dài/body.
- Rate limit 10 creates/phút/IP/isolate (best effort, không toàn cục).
- Không hỗ trợ vanity code nên giảm khả năng chiếm đoạt/tìm mã theo ý muốn.

Trước khi mở rộng người dùng, cần shared rate limiter/WAF, cơ chế report/disable và retention/cleanup policy. Cân nhắc hiển thị hostname đích trước redirect nếu product ưu tiên minh bạch.

## Quyền riêng tư

Không yêu cầu account, không lưu IP hoặc click count. Bản ghi gồm code, destination URL, timestamp; URL có thể chứa thông tin nhạy cảm. Người dùng nên chỉ rút gọn URL dự định chia sẻ công khai. Nêu chính sách dữ liệu và đầu mối gỡ link trước khi public service rộng.
