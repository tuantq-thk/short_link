import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkCreateRateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizeDestination } from '@/lib/url';
import { getClientIp } from '@/lib/http';
import { getShortUrlBase, insertShortLink } from '@/lib/short-link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BULK_ITEMS = 10;
const itemSchema = z.object({
  label: z.string().max(200).optional().default('').transform((label) => label.replace(/[\r\n]+/g, ' ').trim()),
  url: z.string().max(4_000),
}).strict();
const requestSchema = z.object({ items: z.array(itemSchema).min(1).max(MAX_BULK_ITEMS) }).strict();

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu gửi lên chưa đúng định dạng.' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: `Mỗi lần chỉ hỗ trợ tối đa ${MAX_BULK_ITEMS} hàng gồm URL và label tùy chọn.` }, { status: 400 });
  }

  const ip = getClientIp(request);
  const limit = checkCreateRateLimit(ip, parsed.data.items.length);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Bạn tạo link hơi nhanh. Vui lòng thử lại sau.' }, {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfter), 'Cache-Control': 'no-store' },
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const base = getShortUrlBase(request);
    const results = [];
    for (const item of parsed.data.items) {
      const destination = normalizeDestination(item.url);
      if (!destination.ok) {
        results.push({ label: item.label, error: destination.message });
        continue;
      }

      try {
        const created = await insertShortLink(supabase, destination.url);
        results.push(created && 'code' in created
          ? { label: item.label, shortUrl: `${base}/${created.code}` }
          : { label: item.label, error: 'Chưa tạo được link.' });
      } catch (error) {
        console.error('bulk_link_item_failed', error instanceof Error ? error.message : 'unknown');
        results.push({ label: item.label, error: 'Chưa tạo được link.' });
      }
    }
    const hasErrors = results.some((item) => 'error' in item);
    return NextResponse.json({ results }, {
      status: hasErrors ? 207 : 201,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('bulk_link_create_unavailable', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Dịch vụ đang tạm thời bận. Vui lòng thử lại sau.' }, { status: 503 });
  }
}
