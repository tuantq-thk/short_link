'use client';

import { FormEvent, useRef, useState } from 'react';

type CreatedLink = { code: string; shortUrl: string };
type BulkResult = { label: string; shortUrl?: string; error?: string };
type BulkRow = { id: number; label: string; url: string };
type Mode = 'single' | 'bulk';

async function postJson<T>(endpoint: string, body: unknown): Promise<{ response: Response; payload: T }> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { response, payload: await response.json() as T };
}

export function LinkShortener() {
  const [mode, setMode] = useState<Mode>('single');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<CreatedLink | null>(null);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([{ id: 1, label: '', url: '' }]);
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bulkIdRef = useRef(2);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);
    try {
      const { response, payload } = await postJson<CreatedLink | { error: string }>('/api/links', { url });
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

  async function submitBulk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const filledRows = bulkRows.filter((row) => row.label.trim() || row.url.trim());
    const rowWithMissingUrl = filledRows.find((row) => !row.url.trim());
    if (!filledRows.length) {
      setError('Hãy nhập ít nhất một đường dẫn.');
      return;
    }
    if (rowWithMissingUrl) {
      setError('Mỗi dòng đã bắt đầu nhập cần có đường dẫn. Label có thể để trống.');
      return;
    }
    if (filledRows.length > 10) {
      setError('Mỗi lần chỉ hỗ trợ tối đa 10 dòng.');
      return;
    }

    setLoading(true);
    setError('');
    setBulkResults([]);
    setCopied(false);
    try {
      const { response, payload } = await postJson<{ results?: BulkResult[]; error?: string }>('/api/links/bulk', {
        items: filledRows.map((row) => ({ label: row.label.trim(), url: row.url.trim() })),
      });
      if (!response.ok && !payload.results) {
        setError(payload.error || 'Chưa tạo được các link. Vui lòng thử lại.');
        return;
      }
      setBulkResults(payload.results || []);
      if (!payload.results?.some((item) => item.shortUrl)) setError('Chưa tạo được link nào. Vui lòng thử lại.');
    } catch {
      setError('Không kết nối được. Kiểm tra mạng rồi thử lại nhé.');
    } finally {
      setLoading(false);
    }
  }

  function bulkReport() {
    return bulkResults
      .filter((item): item is BulkResult & { shortUrl: string } => Boolean(item.shortUrl))
      .map((item) => item.label ? `${item.label} : ${item.shortUrl}` : item.shortUrl)
      .join('\n');
  }

  function updateBulkRow(id: number, field: 'label' | 'url', value: string) {
    setBulkRows((rows) => rows.map((row) => row.id === id ? { ...row, [field]: value } : row));
    setError('');
  }

  function addBulkRow() {
    if (bulkRows.length >= 10) {
      setError('Mỗi lần chỉ hỗ trợ tối đa 10 dòng.');
      return;
    }
    setBulkRows((rows) => [...rows, { id: bulkIdRef.current++, label: '', url: '' }]);
  }

  function removeBulkRow(id: number) {
    setBulkRows((rows) => rows.length === 1 ? rows : rows.filter((row) => row.id !== id));
  }

  async function copyBulkReport() {
    const report = bulkReport();
    if (!report) return;
    await copyText(report, 'Không sao chép tự động được. Bạn hãy chọn và sao chép report.');
  }

  function bulkErrors() {
    return bulkResults.filter((item) => item.error);
  }

  function downloadBulkReport() {
    const report = bulkReport();
    if (!report) return;
    const blob = new Blob([`${report}\n`], { type: 'text/plain;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = 'teamkit-links.txt';
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  async function copyLink() {
    if (!result) return;
    await copyText(result.shortUrl, 'Không sao chép tự động được. Bạn hãy chọn và sao chép đường dẫn.');
  }

  async function copyText(text: string, fallbackMessage: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(fallbackMessage);
    }
  }

  function reset() {
    setResult(null);
    setError('');
    setUrl('');
    inputRef.current?.focus();
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setResult(null);
    setBulkResults([]);
    setError('');
    setCopied(false);
  }

  return (
    <div className="shortener-card">
      <div className="mode-switch" role="tablist" aria-label="Kiểu rút gọn link">
        <button className={mode === 'single' ? 'mode-tab active' : 'mode-tab'} type="button" role="tab" aria-selected={mode === 'single'} onClick={() => switchMode('single')}>Một link</button>
        <button className={mode === 'bulk' ? 'mode-tab active' : 'mode-tab'} type="button" role="tab" aria-selected={mode === 'bulk'} onClick={() => switchMode('bulk')}>Nhiều link</button>
      </div>
      {mode === 'single' && !result ? (
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
      ) : mode === 'single' && result ? (
        <div className="result-panel" aria-live="polite">
          <div className="result-heading"><span className="success-mark" aria-hidden="true">✓</span><div><strong>Link của bạn đã sẵn sàng</strong><span>Có thể chia sẻ ngay bây giờ</span></div></div>
          <div className="result-url-row"><a href={result!.shortUrl} target="_blank" rel="noreferrer">{result!.shortUrl}</a><button className="copy-button" onClick={copyLink} type="button">{copied ? 'Đã sao chép ✓' : 'Sao chép'}</button></div>
          <button className="make-another" type="button" onClick={reset}>+ Tạo link khác</button>
        </div>
      ) : (
        <form onSubmit={submitBulk} noValidate>
          <div className="bulk-rows" aria-describedby={error ? 'bulk-message' : 'bulk-help'}>
            {bulkRows.map((row, index) => (
              <div className="bulk-row" key={row.id}>
                <div className="bulk-field bulk-label-field">
                  <label htmlFor={`bulk-label-${row.id}`}>Label {index + 1}</label>
                  <input id={`bulk-label-${row.id}`} value={row.label} onChange={(event) => updateBulkRow(row.id, 'label', event.target.value)} maxLength={200} placeholder="Tùy chọn" />
                </div>
                <div className="bulk-field bulk-url-field">
                  <label htmlFor={`bulk-url-${row.id}`}>Link *</label>
                  <input id={`bulk-url-${row.id}`} type="url" inputMode="url" value={row.url} onChange={(event) => updateBulkRow(row.id, 'url', event.target.value)} maxLength={4000} placeholder="https://example.com" required={Boolean(row.label.trim())} aria-required={Boolean(row.label.trim())} />
                </div>
                <button className="remove-row" type="button" onClick={() => removeBulkRow(row.id)} disabled={bulkRows.length === 1} aria-label={`Xóa dòng ${index + 1}`}>×</button>
              </div>
            ))}
          </div>
          <div className="bulk-toolbar"><button className="add-row" type="button" onClick={addBulkRow} disabled={bulkRows.length >= 10}>+ Thêm dòng</button><span id="bulk-help" className="input-help">Label có thể để trống · tối đa 10 link</span></div>
          <div className="form-bottom">
            <button className="submit-button" type="submit" disabled={loading || !bulkRows.some((row) => row.url.trim())}>
              {loading ? <><span className="spinner" aria-hidden="true" />Đang tạo...</> : <>Rút gọn tất cả <span aria-hidden="true">↗</span></>}
            </button>
          </div>
          {error && <p id="bulk-message" className="message error-message" role="alert">{error}</p>}
          {bulkResults.length > 0 && (
            <div className="bulk-result" aria-live="polite">
              <div className="result-heading"><span className="success-mark" aria-hidden="true">✓</span><div><strong>Report đã sẵn sàng</strong><span>Copy text hoặc tải file để gửi</span></div></div>
              <pre className="bulk-report">{bulkReport()}</pre>
              <div className="bulk-actions"><button className="copy-button" type="button" onClick={copyBulkReport}>{copied ? 'Đã sao chép ✓' : 'Copy report'}</button><button className="download-button" type="button" onClick={downloadBulkReport}>Tải file .txt</button></div>
              {bulkErrors().length > 0 && <div className="bulk-errors"><p className="message error-message">Một số dòng chưa tạo được link:</p><ul>{bulkErrors().map((item, index) => <li key={`${item.label}-${index}`}>{item.label || `Dòng ${index + 1}`}: {item.error}</li>)}</ul></div>}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
