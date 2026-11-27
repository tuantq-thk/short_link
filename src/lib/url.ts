import { MAX_URL_LENGTH } from '@/lib/constants';

export type UrlValidationResult = { ok: true; url: string } | { ok: false; message: string };

/** Accepts all public URL schemes except executable/local-only schemes. */
export function normalizeDestination(input: string): UrlValidationResult {
  const candidate = input.trim();
  if (!candidate) return { ok: false, message: 'Hãy dán đường dẫn bạn muốn rút gọn.' };
  if (candidate.length > MAX_URL_LENGTH) {
    return { ok: false, message: 'Đường dẫn quá dài. Giới hạn là 4.000 ký tự.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      ok: false,
      message: 'Đường dẫn chưa hợp lệ. Hãy nhập đầy đủ, ví dụ https://example.com.',
    };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return {
      ok: false,
      message: 'Hiện chỉ hỗ trợ đường dẫn web bắt đầu bằng http:// hoặc https://.',
    };
  }
  if (!parsed.hostname || parsed.hostname.includes(' ')) {
    return { ok: false, message: 'Đường dẫn cần có tên miền hợp lệ.' };
  }

  return { ok: true, url: parsed.toString() };
}
