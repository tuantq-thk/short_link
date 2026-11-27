export function getClientIp(request: Request): string {
  // Vercel supplies x-forwarded-for. Use only the first value and never trust it for identity/auth.
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}
