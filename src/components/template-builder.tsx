'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_TEMPLATES,
  extractTemplateVariables,
  formatVariableName,
  LEGACY_TEMPLATE_STORAGE_KEY,
  renderTemplate,
  TEMPLATE_STORAGE_KEY,
  type ToolTemplate,
} from '@/lib/template-utils';
import { TEMPLATE_STORAGE_MODE } from '@/lib/template-config';

function initialValues(content: string): Record<string, string> {
  return Object.fromEntries(extractTemplateVariables(content).map((variable) => [variable, '']));
}

function valuesForTemplate(template: ToolTemplate): Record<string, string> {
  if (template.id !== 'chatwork-task-report') return initialValues(template.content);
  return {
    ...initialValues(template.content),
    spec: '->',
    design: '->',
    pull_request: '->',
    pr_summary: 'Chưa có thay đổi đáng chú ý',
    impact: '->',
    done: 'Đã hoàn thành theo phạm vi trên',
    remaining: '->',
    confirmation: '->',
  };
}

export function TemplateBuilder() {
  const [templates, setTemplates] = useState<ToolTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedId, setSelectedId] = useState(DEFAULT_TEMPLATES[0].id);
  const [name, setName] = useState(DEFAULT_TEMPLATES[0].name);
  const [description, setDescription] = useState(DEFAULT_TEMPLATES[0].description);
  const [content, setContent] = useState(DEFAULT_TEMPLATES[0].content);
  const [values, setValues] = useState<Record<string, string>>(() => valuesForTemplate(DEFAULT_TEMPLATES[0]));
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (TEMPLATE_STORAGE_MODE === 'supabase') {
      fetch('/api/templates')
        .then(async (response) => {
          const payload = await response.json() as { templates?: ToolTemplate[]; error?: string };
          if (!response.ok) throw new Error(payload.error || 'Không tải được template.');
          return payload.templates || [];
        })
        .then((saved) => {
          if (!cancelled) setTemplates(saved.length ? saved : DEFAULT_TEMPLATES);
        })
        .catch((error: unknown) => {
          if (!cancelled) setNotice(error instanceof Error ? error.message : 'Không tải được template từ Supabase.');
        });
      return () => { cancelled = true; };
    }

    try {
      const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY) || localStorage.getItem(LEGACY_TEMPLATE_STORAGE_KEY) || '[]';
      const saved = JSON.parse(stored) as ToolTemplate[];
      if (Array.isArray(saved)) setTemplates([...DEFAULT_TEMPLATES, ...saved.filter((item) => !item.builtIn)]);
    } catch {
      setNotice('Không đọc được template đã lưu trên trình duyệt.');
    }
    return () => { cancelled = true; };
  }, []);

  const variables = useMemo(() => extractTemplateVariables(content), [content]);
  const rendered = useMemo(() => renderTemplate(content, values), [content, values]);

  function persistLocal(nextTemplates: ToolTemplate[]) {
    setTemplates(nextTemplates);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(nextTemplates.filter((item) => !item.builtIn)));
  }

  function loadTemplate(template: ToolTemplate) {
    setSelectedId(template.id);
    setName(template.name);
    setDescription(template.description);
    setContent(template.content);
    setValues(valuesForTemplate(template));
    setNotice('');
    setCopied(false);
  }

  function createTemplate() {
    setSelectedId('new');
    setName('Template mới');
    setDescription('');
    setContent('');
    setValues({});
    setNotice('Đang tạo template mới. Dùng {{ten_bien}} để tạo ô nhập giá trị.');
    setCopied(false);
  }

  async function saveTemplate() {
    if (!name.trim() || !content.trim()) {
      setNotice('Template cần có tên và nội dung.');
      return;
    }
    const current = templates.find((item) => item.id === selectedId);
    const id = selectedId === 'new' || current?.builtIn ? `custom-${Date.now()}` : selectedId;
    const nextTemplate: ToolTemplate = { id, name: name.trim(), description: description.trim(), content };
    setSaving(true);
    try {
      if (TEMPLATE_STORAGE_MODE === 'supabase') {
        const response = await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextTemplate) });
        const payload = await response.json() as { template?: ToolTemplate; error?: string };
        if (!response.ok || !payload.template) throw new Error(payload.error || 'Không lưu được template.');
        const nextTemplates = [...templates.filter((item) => item.id !== payload.template!.id), payload.template];
        setTemplates(nextTemplates);
        setSelectedId(payload.template.id);
        setNotice('Đã lưu template vào Supabase.');
      } else {
        persistLocal([...templates.filter((item) => item.id !== id), nextTemplate]);
        setSelectedId(id);
        setNotice('Đã lưu template trên trình duyệt này.');
      }
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : 'Không lưu được template.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate() {
    const selected = templates.find((item) => item.id === selectedId);
    if (!selected || selected.builtIn) return;
    const nextTemplates = templates.filter((item) => item.id !== selectedId);
    setSaving(true);
    try {
      if (TEMPLATE_STORAGE_MODE === 'supabase') {
        const response = await fetch(`/api/templates?id=${encodeURIComponent(selectedId)}`, { method: 'DELETE' });
        const payload = response.status === 204 ? {} : await response.json() as { error?: string };
        if (!response.ok) throw new Error(payload.error || 'Không xóa được template.');
        setTemplates(nextTemplates);
      } else {
        persistLocal(nextTemplates);
      }
      loadTemplate(nextTemplates[0]);
      setNotice('Đã xóa template.');
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : 'Không xóa được template.');
    } finally {
      setSaving(false);
    }
  }

  async function copyRendered() {
    try {
      await navigator.clipboard.writeText(rendered);
      setCopied(true);
      setNotice('Đã copy nội dung report.');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice('Không copy tự động được. Hãy chọn nội dung trong ô preview để copy.');
    }
  }

  function updateContent(nextContent: string) {
    setContent(nextContent);
    setValues((current) => ({ ...initialValues(nextContent), ...current }));
  }

  const selected = templates.find((item) => item.id === selectedId);

  return (
    <div className="template-builder">
      <div className="template-topline"><div className="tool-heading compact-heading"><span className="tool-kicker">TEMPLATE BUILDER</span><h1>Tạo text để copy và gửi</h1><p>Dùng placeholder dạng <code>{'{{ten_bien}}'}</code>; {TEMPLATE_STORAGE_MODE === 'supabase' ? 'template dùng chung qua Supabase.' : 'template lưu riêng trên trình duyệt.'}</p></div><button className="secondary-button new-template-button" type="button" onClick={createTemplate}>+ Tạo template</button></div>
      <div className="template-library">
        <div className="template-library-heading"><span>Template library</span><small>{templates.length} template</small></div>
        <div className="template-list">
          {templates.map((template) => <button className={template.id === selectedId ? 'template-item active' : 'template-item'} type="button" key={template.id} onClick={() => loadTemplate(template)}><strong>{template.name}</strong><span>{template.description || 'Template cá nhân'}</span></button>)}
        </div>
      </div>
      <div className="template-editor">
        <div className="template-workbench">
          <section className="template-compose"><div className="template-section-heading"><span>Template details</span><small>{selected?.builtIn ? 'Mặc định' : 'Cá nhân'}</small></div><div className="template-meta"><label>Tên template<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Release report" /></label><label>Mô tả<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Template dùng cho..." /></label></div><label className="template-content-label">Nội dung template<textarea className="template-content" value={content} onChange={(event) => updateContent(event.target.value)} placeholder="Viết nội dung và dùng {{placeholder}}..." rows={12} /></label><div className="template-editor-actions"><button className="secondary-button" type="button" onClick={saveTemplate} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu template'}</button>{selected && !selected.builtIn && <button className="danger-button" type="button" onClick={deleteTemplate} disabled={saving}>Xóa</button>}{notice && <span className="template-notice">{notice}</span>}</div></section>
          <section className="template-preview"><div className="template-section-heading"><span>Preview</span><button className="copy-button" type="button" onClick={copyRendered}>{copied ? 'Đã copy ✓' : 'Copy text'}</button></div><pre>{rendered || 'Preview sẽ hiển thị ở đây.'}</pre></section>
        </div>
        <div className="template-values"><div className="template-section-heading"><span>Nhập giá trị</span><small>{variables.length} placeholder · giá trị không được gửi lên server</small></div><div className="template-values-grid">{variables.length ? variables.map((variable) => <label key={variable}>{formatVariableName(variable)}<textarea value={values[variable] ?? ''} onChange={(event) => setValues((current) => ({ ...current, [variable]: event.target.value }))} rows={variable.includes('summary') || variable.includes('message') || variable.includes('done') || variable.includes('remaining') || variable.includes('confirmation') ? 3 : 1} placeholder="Có thể để trống" /></label>) : <p className="empty-state">Thêm placeholder vào nội dung để xuất hiện ô nhập.</p>}</div>
        </div>
      </div>
    </div>
  );
}
