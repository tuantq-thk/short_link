import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateShortCode } from '@/lib/code';
import { checkCreateRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizeDestination } from '@/lib/url';
import { getClientIp } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({ url: z.string().max(4_000) }).strict();

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkCreateRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Bạn tạo link hơi nhanh. Vui lòng thử lại sau.' }, {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfter), 'Cache-Control': 'no-store' },
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu gửi lên chưa đúng định dạng.' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Đường dẫn không hợp lệ hoặc quá dài.' }, { status: 400 });
  }
  const destination = normalizeDestination(parsed.data.url);
  if (!destination.ok) return NextResponse.json({ error: destination.message }, { status: 400 });

  try {
    const supabase = getSupabaseAdmin();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const code = generateShortCode();
      const { error } = await supabase.from('links').insert({ code, destination_url: destination.url });
      if (!error) {
        const requestOrigin = new URL(request.url).origin;
        const configuredBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
        let base = requestOrigin;
        if (configuredBase) {
          try {
            const configuredUrl = new URL(configuredBase);
            const isLocalhost = configuredUrl.hostname === 'localhost' || configuredUrl.hostname === '127.0.0.1';
            if (!isLocalhost && ['http:', 'https:'].includes(configuredUrl.protocol)) base = configuredUrl.origin;
          } catch {
            // Invalid canonical URL must not make a valid link point nowhere.
          }
        }
        return NextResponse.json({ code, shortUrl: `${base}/${code}` }, {
          status: 201,
          headers: { 'Cache-Control': 'no-store' },
        });
      }
      if (error.code !== '23505') {
        console.error('link_create_failed', { code: error.code, message: error.message });
        return NextResponse.json({ error: 'Chưa tạo được link. Vui lòng thử lại sau.' }, { status: 503 });
      }
    }
    return NextResponse.json({ error: 'Không tạo được mã ngắn. Vui lòng thử lại.' }, { status: 503 });
  } catch (error) {
    console.error('link_create_unavailable', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Dịch vụ đang tạm thời bận. Vui lòng thử lại sau.' }, { status: 503 });
  }
}
