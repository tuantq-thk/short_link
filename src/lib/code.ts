import { CODE_ALPHABET, CODE_LENGTH } from '@/lib/constants';

export function generateShortCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}
