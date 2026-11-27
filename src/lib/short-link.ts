import type { SupabaseClient } from '@supabase/supabase-js';
import { generateShortCode } from '@/lib/code';

type LinkInsertResult = { code: string } | { error: string };

export async function insertShortLink(
  supabase: SupabaseClient,
  destination: string,
): Promise<LinkInsertResult> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = generateShortCode();
    const { error } = await supabase.from('links').insert({ code, destination_url: destination });
    if (!error) return { code };
    if (error.code !== '23505') return { error: error.message };
  }
  return { error: 'Không tạo được mã ngắn sau nhiều lần thử.' };
}

export function getShortUrlBase(request: Request): string {
  const requestOrigin = new URL(request.url).origin;
  const configuredBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredBase) return requestOrigin;

  try {
    const configuredUrl = new URL(configuredBase);
    const isLocalhost =
      configuredUrl.hostname === 'localhost' || configuredUrl.hostname === '127.0.0.1';
    if (!isLocalhost && ['http:', 'https:'].includes(configuredUrl.protocol))
      return configuredUrl.origin;
  } catch {
    // Invalid canonical URL must not make a valid link point nowhere.
  }
  return requestOrigin;
}
