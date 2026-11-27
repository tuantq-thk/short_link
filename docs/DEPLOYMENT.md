# Deploy

## 1. Tạo database Supabase

1. Tạo project Free.
2. Mở SQL Editor và chạy `supabase/migrations/202611270001_create_links.sql`.
3. Chạy tiếp `supabase/migrations/202611270002_grant_links_to_service_role.sql` để cấp quyền tối thiểu cho server role.
4. Nếu muốn lưu template dùng chung, chạy thêm `supabase/migrations/202611270003_create_templates.sql`.
5. Trong Project Settings → API, lấy Project URL và service role secret.
6. Không đưa service role secret vào mã nguồn, client code hoặc biến `NEXT_PUBLIC_*`.

## 2. Cấu hình Vercel

1. Import repository vào Vercel.
2. Framework preset: Next.js; build command `npm run build`.
3. Thêm các env vars:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (canonical origin, không có slash cuối)
   - `NEXT_PUBLIC_TEMPLATE_STORAGE_MODE`: `local` hoặc `supabase`; deploy team dùng chung nên chọn `supabase`.
4. Deploy production.

## 3. CI/CD với GitHub Actions

Workflow [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml) chỉ làm CI:

- chạy `npm ci`, `npm run typecheck`, `npm run lint` và `npm run build` cho mọi pull request;
- chạy lại toàn bộ kiểm tra trên mỗi push vào `main` hoặc `master`;
- workflow không deploy Vercel và không cần `VERCEL_TOKEN`, `VERCEL_ORG_ID` hay `VERCEL_PROJECT_ID`.

Vercel deploy theo Git Integration:

1. Trong Vercel, Import repository này và chọn framework Next.js.
2. Đặt Production Branch là `master` (hoặc `main` nếu đổi branch chính).
3. Bật automatic deployments. Pull request sẽ tạo Preview Deployment; push vào Production Branch sẽ tạo Production Deployment.
4. Khai báo các runtime env trong Vercel Project Settings → Environment Variables, không khai báo trong GitHub Actions.

Với cách này, GitHub Actions chỉ trả lời “code có qua kiểm tra không”, còn Vercel chịu trách nhiệm build/deploy như một project Vercel thông thường.

`NEXT_PUBLIC_TEMPLATE_STORAGE_MODE=local` không gọi Supabase template API và giữ template trong browser. `NEXT_PUBLIC_TEMPLATE_STORAGE_MODE=supabase` gọi `/api/templates`; API dùng service role ở server để đọc/ghi bảng `public.templates`.

### Lỗi `permission denied for table links`

- Xác nhận `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` trong Vercel Production đang trỏ tới cùng project Supabase.
- Đảm bảo key là service role/secret key; không dùng anon/publishable key.
- Chạy migration `202611270002_grant_links_to_service_role.sql` trong đúng Supabase project, sau đó redeploy.
- Không cấp quyền `insert`/`select` cho `anon` hoặc `authenticated` để sửa lỗi này; API phải tiếp tục dùng server role.

### Template không tải được

- Kiểm tra đã chạy migration `202611270003_create_templates.sql` trong đúng project.
- Kiểm tra `NEXT_PUBLIC_TEMPLATE_STORAGE_MODE=supabase` đã được set ở Vercel Production và redeploy.
- Template API hiện chưa có authentication; ở chế độ `supabase`, bất kỳ người truy cập được app đều có thể đọc/sửa template. Chỉ dùng cho môi trường internal được bảo vệ hoặc bổ sung Auth trước khi public.

### Short URL trỏ về `localhost`

`NEXT_PUBLIC_APP_URL` trong local có thể là `http://localhost:3000`, nhưng Production phải dùng origin Vercel hoặc custom domain. Code cũng tự bỏ qua giá trị localhost trong môi trường deploy và dùng origin thực tế của request để tránh tạo link hỏng.

## 4. Local development

```bash
cp .env.example .env.local
# điền giá trị thật
npm install
npm run dev
```

## 5. Smoke check sau deploy

- Homepage trả HTTP 200.
- Gửi thiếu URL → 400 với thông báo.
- `javascript:alert(1)` và `data:text/html,...` → bị từ chối.
- URL HTTP/HTTPS hợp lệ → 201 và trả short URL.
- Mở short URL → 302 tới đúng destination.
- Mã không tồn tại/sai định dạng → 404.
- Mở cùng mã vài lần → kiểm tra `Age`/cache header theo CDN thực tế.
- Xác nhận không có Supabase service role key trong HTML hoặc JavaScript bundle.

## 6. Free tier

Free tiers thay đổi theo thời gian, loại tài khoản và mục đích sử dụng. Xem hạn mức trực tiếp trong dashboard/provider docs trước khi đưa dịch vụ cho người dùng phụ thuộc vào nó. Supabase Free có thể pause dự án khi ít hoạt động; khi resume có thể cần thao tác thủ công. Vercel Hobby có điều kiện phi thương mại.
