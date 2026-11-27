# Deploy

## 1. Tạo database Supabase

1. Tạo project Free.
2. Mở SQL Editor và chạy `supabase/migrations/202611270001_create_links.sql`.
3. Chạy tiếp `supabase/migrations/202611270002_grant_links_to_service_role.sql` để cấp quyền tối thiểu cho server role.
4. Trong Project Settings → API, lấy Project URL và service role secret.
5. Không đưa service role secret vào mã nguồn, client code hoặc biến `NEXT_PUBLIC_*`.

## 2. Cấu hình Vercel

1. Import repository vào Vercel.
2. Framework preset: Next.js; build command `npm run build`.
3. Thêm các env vars:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (canonical origin, không có slash cuối)
4. Deploy production.

## 3. CI/CD với GitHub Actions

Workflow [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml) sẽ:

- chạy `npm ci`, `npm run typecheck`, `npm run lint` và `npm run build` cho mọi pull request;
- chạy lại toàn bộ kiểm tra trên mỗi push vào `main` hoặc `master`;
- deploy production tự động sau khi kiểm tra thành công trên `main` hoặc `master`.

Trong GitHub repository, tạo các Actions secrets sau:

- `VERCEL_TOKEN`: token tạo trong Vercel Account → Tokens;
- `VERCEL_ORG_ID`: giá trị `orgId` trong `.vercel/project.json` sau khi chạy `npx vercel link`;
- `VERCEL_PROJECT_ID`: giá trị `projectId` trong cùng file.

Có thể đặt các secrets này ở environment `production` để thêm approval trước deploy. Các biến runtime `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` và `NEXT_PUBLIC_APP_URL` vẫn phải được cấu hình trong Vercel Project Settings cho Production; workflow lấy chúng qua `vercel pull`, không ghi secret vào repository.

Nếu đã bật Vercel Git Integration cho cùng repository, chỉ dùng một cơ chế deploy production để tránh deploy hai lần. Với workflow này, hãy tắt automatic production deploy của Git Integration hoặc chỉ dùng Git Integration và giữ lại phần CI.

### Lỗi `permission denied for table links`

- Xác nhận `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` trong Vercel Production đang trỏ tới cùng project Supabase.
- Đảm bảo key là service role/secret key; không dùng anon/publishable key.
- Chạy migration `202611270002_grant_links_to_service_role.sql` trong đúng Supabase project, sau đó redeploy.
- Không cấp quyền `insert`/`select` cho `anon` hoặc `authenticated` để sửa lỗi này; API phải tiếp tục dùng server role.

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
