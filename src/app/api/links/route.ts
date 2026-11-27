import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkCreateRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizeDestination } from '@/lib/url';
import { getClientIp } from '@/lib/http';
import { getShortUrlBase, insertShortLink } from '@/lib/short-link';

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
    const created = await insertShortLink(supabase, destination.url);
    if ('error' in created) {
      console.error('link_create_failed', { message: created.error });
      return NextResponse.json({ error: 'Chưa tạo được link. Vui lòng thử lại sau.' }, { status: 503 });
    }
    return NextResponse.json({ code: created.code, shortUrl: `${getShortUrlBase(request)}/${created.code}` }, {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('link_create_unavailable', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Dịch vụ đang tạm thời bận. Vui lòng thử lại sau.' }, { status: 503 });
  }
}
