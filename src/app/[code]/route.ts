import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { CODE_ALPHABET, CODE_LENGTH } from '@/lib/constants';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  if (code.length !== CODE_LENGTH || [...code].some((char) => !CODE_ALPHABET.includes(char))) {
    return new Response('Link không tồn tại.', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('links')
      .select('destination_url')
      .eq('code', code)
      .maybeSingle();
    if (error || !data) {
      return new Response('Link không tồn tại hoặc đã bị gỡ.', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.redirect(data.destination_url, {
      status: 302,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
        'Referrer-Policy': 'no-referrer',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch {
    return new Response('Dịch vụ đang tạm thời bận. Vui lòng thử lại sau.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'Retry-After': '30' },
    });
  }
}
