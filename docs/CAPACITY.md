# Capacity và giới hạn

## Ước lượng request

10 request/giây liên tục ≈ 864.000/ngày ≈ 25,9 triệu/tháng (30 ngày). Con số này khác nhiều so với burst 10 RPS trong vài phút. Redirect cache có thể giảm function invocation/DB reads với cùng một mã được truy cập lặp, nhưng không nhất thiết giảm request CDN và không giúp nhiều nếu mỗi mã chỉ được mở một lần.

## Gói miễn phí

Tại thời điểm viết tài liệu, Vercel Hobby công bố 1 triệu function invocations/tháng, giới hạn tài nguyên khác và điều kiện sử dụng phi thương mại. Supabase Free công bố quota database/egress và có cơ chế pause project khi ít hoạt động. Các giới hạn có thể thay đổi; kiểm tra trang Pricing/Usage đang áp dụng cho tài khoản trước khi dựa vào đó.

Do đó:

- MVP thử nghiệm, truy cập thưa và burst nhỏ: có thể bắt đầu ở free tier.
- 10 RPS kéo dài cả tháng: vượt xa mốc 1 triệu invocation nếu mỗi request chạy function; không thể hứa hoạt động free.
- Một đợt 10 RPS: không quá lớn về mặt thiết kế nhưng phải load-test deployment và quan sát quotas.
- Vercel/Supabase không cung cấp SLA ở các gói này; không thể đảm bảo availability.

## Nút thắt và hướng xử lý

1. **Function invocations/egress:** cache ở CDN, giữ response nhỏ, không thêm framework client lớn.
2. **Database reads:** redirect cache cho link lặp; kiểm tra Supabase connection pooling/latency.
3. **Database writes/abuse:** rate limit shared, captcha/risk challenge nếu spam xuất hiện, không tạo analytics write cho mỗi click.
4. **Cold/inactive project:** Free Supabase có thể pause; dịch vụ public cần kế hoạch resume/paid tier khi bắt đầu được phụ thuộc.

Tải 10 RPS không phải là cam kết hiệu năng từ một con số đơn lẻ. Để gọi là đạt, cần đo trên deployment và xác định thời lượng, cache-hit ratio, response percentile và mức lỗi chấp nhận được.
