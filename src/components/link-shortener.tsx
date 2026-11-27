'use client';

import { FormEvent, useRef, useState } from 'react';

type CreatedLink = { code: string; shortUrl: string };

export function LinkShortener() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<CreatedLink | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const payload = await response.json() as CreatedLink | { error: string };
      if (!response.ok) {
        setError('error' in payload ? payload.error : 'Chưa tạo được link. Vui lòng thử lại.');
        return;
      }
      setResult(payload as CreatedLink);
    } catch {
      setError('Không kết nối được. Kiểm tra mạng rồi thử lại nhé.');
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Không sao chép tự động được. Bạn hãy chọn và sao chép đường dẫn.');
    }
  }

  function reset() {
    setResult(null);
    setError('');
    setUrl('');
    inputRef.current?.focus();
  }

  return (
    <div className="shortener-card">
      {!result ? (
        <form onSubmit={submit} noValidate>
          <label className="input-label" htmlFor="long-url">Đường dẫn của bạn</label>
          <div className="input-row">
            <span className="input-link-icon" aria-hidden="true">↗</span>
            <input ref={inputRef} id="long-url" type="url" inputMode="url" autoComplete="url" placeholder="Dán đường dẫn dài tại đây..." value={url} onChange={(event) => setUrl(event.target.value)} maxLength={4000} aria-describedby={error ? 'form-message' : 'input-help'} aria-invalid={Boolean(error)} required />
            {url && <button className="clear-button" type="button" onClick={() => { setUrl(''); setError(''); inputRef.current?.focus(); }} aria-label="Xóa đường dẫn">×</button>}
          </div>
          <div className="form-bottom">
            <span id="input-help" className="input-help">Hỗ trợ đường dẫn http:// và https://</span>
            <button className="submit-button" type="submit" disabled={loading || !url.trim()}>
              {loading ? <><span className="spinner" aria-hidden="true" />Đang tạo...</> : <>Rút gọn link <span aria-hidden="true">↗</span></>}
            </button>
          </div>
          {error && <p id="form-message" className="message error-message" role="alert">{error}</p>}
        </form>
      ) : (
        <div className="result-panel" aria-live="polite">
          <div className="result-heading"><span className="success-mark" aria-hidden="true">✓</span><div><strong>Link của bạn đã sẵn sàng</strong><span>Có thể chia sẻ ngay bây giờ</span></div></div>
          <div className="result-url-row"><a href={result.shortUrl} target="_blank" rel="noreferrer">{result.shortUrl}</a><button className="copy-button" onClick={copyLink} type="button">{copied ? 'Đã sao chép ✓' : 'Sao chép'}</button></div>
          <button className="make-another" type="button" onClick={reset}>+ Tạo link khác</button>
        </div>
      )}
    </div>
  );
}
