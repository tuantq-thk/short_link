# Roadmap

## MVP 0.1 — hiện tại

- Tạo link public, redirect, copy, validation, best-effort rate limit.
- Internal tools workspace với bulk link report và Template Builder local-first.

## 0.2 — vận hành an toàn hơn

- Shared rate limiting/WAF; dashboard quota và alert.
- Báo cáo link, khả năng disable link bị lạm dụng, chính sách retention.
- Cân nhắc trang trung gian hiển thị hostname đích.

## 0.3 — tiện ích

- Tùy chọn mã ngắn dễ nhớ; QR code; preview domain.
- Analytics tổng hợp có privacy controls nếu có nhu cầu.

## Điều kiện trước khi thêm tính năng

Giữ đường redirect nhẹ, đo trước khi thêm analytics ghi mỗi click. Không thu thập dữ liệu người dùng nếu không phục vụ nhu cầu rõ ràng.
