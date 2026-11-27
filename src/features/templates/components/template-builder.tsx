'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/template-builder.module.css';
import { SectionCard } from '@/shared/components/section-card';
import { ToolKicker } from '@/shared/components/tool-kicker';
import {
  DEFAULT_TEMPLATES,
  extractTemplateVariables,
  formatVariableName,
  LEGACY_TEMPLATE_STORAGE_KEY,
  renderTemplate,
  TEMPLATE_STORAGE_KEY,
  type ToolTemplate,
} from '@/features/templates/lib/template-utils';
import { TEMPLATE_STORAGE_MODE } from '@/features/templates/lib/template-config';

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
  const [values, setValues] = useState<Record<string, string>>(() =>
    valuesForTemplate(DEFAULT_TEMPLATES[0]),
  );
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeMode, setActiveMode] = useState<'values' | 'details'>('values');
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (TEMPLATE_STORAGE_MODE === 'supabase') {
      fetch('/api/templates')
        .then(async (response) => {
          const payload = (await response.json()) as { templates?: ToolTemplate[]; error?: string };
          if (!response.ok) throw new Error(payload.error || 'Không tải được template.');
          return payload.templates || [];
        })
        .then((saved) => {
          if (!cancelled) {
            const nextTemplates = saved.length ? saved : DEFAULT_TEMPLATES;
            const first = nextTemplates[0];
            setTemplates(nextTemplates);
            if (first) {
              setSelectedId(first.id);
              setName(first.name);
              setDescription(first.description);
              setContent(first.content);
              setValues(valuesForTemplate(first));
            }
          }
        })
        .catch((error: unknown) => {
          if (!cancelled)
            setNotice(
              error instanceof Error ? error.message : 'Không tải được template từ Supabase.',
            );
        });
      return () => {
        cancelled = true;
      };
    }

    try {
      const stored =
        localStorage.getItem(TEMPLATE_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_TEMPLATE_STORAGE_KEY) ||
        '[]';
      const saved = JSON.parse(stored) as ToolTemplate[];
      if (Array.isArray(saved))
        setTemplates([...DEFAULT_TEMPLATES, ...saved.filter((item) => !item.builtIn)]);
    } catch {
      setNotice('Không đọc được template đã lưu trên trình duyệt.');
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const variables = useMemo(() => extractTemplateVariables(content), [content]);
  const rendered = useMemo(() => renderTemplate(content, values), [content, values]);

  function persistLocal(nextTemplates: ToolTemplate[]) {
    setTemplates(nextTemplates);
    localStorage.setItem(
      TEMPLATE_STORAGE_KEY,
      JSON.stringify(nextTemplates.filter((item) => !item.builtIn)),
    );
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
    setActiveMode('details');
  }

  async function importTemplates(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const payload = JSON.parse(await file.text()) as unknown;
      const candidates = Array.isArray(payload) ? payload : [payload];
      const imported = candidates.flatMap((item, index): ToolTemplate[] => {
        if (!item || typeof item !== 'object') return [];
        const record = item as Record<string, unknown>;
        const templateName = typeof record.name === 'string' ? record.name.trim() : '';
        const templateContent = typeof record.content === 'string' ? record.content.trim() : '';
        if (!templateName || !templateContent) return [];
        return [
          {
            id: `imported-${Date.now()}-${index}`,
            name: templateName,
            description: typeof record.description === 'string' ? record.description.trim() : '',
            content: templateContent,
          },
        ];
      });

      if (!imported.length) throw new Error('File không có template hợp lệ (cần name và content).');

      setSaving(true);
      if (TEMPLATE_STORAGE_MODE === 'supabase') {
        const saved: ToolTemplate[] = [];
        for (const template of imported) {
          const response = await fetch('/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(template),
          });
          const result = (await response.json()) as { template?: ToolTemplate; error?: string };
          if (!response.ok || !result.template)
            throw new Error(result.error || 'Không import được template.');
          saved.push(result.template);
        }
        setTemplates((current) => [...current, ...saved]);
        loadTemplate(saved[0]);
      } else {
        const nextTemplates = [...templates, ...imported];
        persistLocal(nextTemplates);
        loadTemplate(imported[0]);
      }
      setNotice(`✓ Đã import ${imported.length} template.`);
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : 'Không đọc được file template.');
    } finally {
      setSaving(false);
    }
  }

  function exportTemplate() {
    const exportName = name.trim() || 'teamkit-template';
    const filename = `${
      exportName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'teamkit-template'
    }.json`;
    const payload = JSON.stringify(
      {
        name: exportName,
        description: description.trim(),
        content,
      },
      null,
      2,
    );
    const objectUrl = URL.createObjectURL(
      new Blob([payload], { type: 'application/json;charset=utf-8' }),
    );
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    setNotice('✓ Đã export template JSON.');
  }

  async function saveTemplate() {
    if (!name.trim() || !content.trim()) {
      setNotice('Template cần có tên và nội dung.');
      return;
    }
    const current = templates.find((item) => item.id === selectedId);
    const id = selectedId === 'new' || current?.builtIn ? `custom-${Date.now()}` : selectedId;
    const nextTemplate: ToolTemplate = {
      id,
      name: name.trim(),
      description: description.trim(),
      content,
    };
    setSaving(true);
    try {
      if (TEMPLATE_STORAGE_MODE === 'supabase') {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextTemplate),
        });
        const payload = (await response.json()) as { template?: ToolTemplate; error?: string };
        if (!response.ok || !payload.template)
          throw new Error(payload.error || 'Không lưu được template.');
        const nextTemplates = [
          ...templates.filter((item) => item.id !== payload.template!.id),
          payload.template,
        ];
        setTemplates(nextTemplates);
        setSelectedId(payload.template.id);
        setNotice('✓ Đã lưu template vào Supabase.');
      } else {
        persistLocal([...templates.filter((item) => item.id !== id), nextTemplate]);
        setSelectedId(id);
        setNotice('✓ Đã lưu template trên trình duyệt này.');
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
        const response = await fetch(`/api/templates?id=${encodeURIComponent(selectedId)}`, {
          method: 'DELETE',
        });
        const payload =
          response.status === 204 ? {} : ((await response.json()) as { error?: string });
        if (!response.ok) throw new Error(payload.error || 'Không xóa được template.');
        setTemplates(nextTemplates);
      } else {
        persistLocal(nextTemplates);
      }
      loadTemplate(nextTemplates[0]);
      setNotice('✓ Đã xóa template.');
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
      setNotice('✓ Đã copy nội dung report.');
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
    <div className={`template-builder ${styles.featureRoot}`}>
      <div className="template-topline">
        <div className="tool-heading compact-heading">
          <ToolKicker>TEMPLATE BUILDER</ToolKicker>
          <h1>Tạo text để copy và gửi</h1>
          <p>
            Dùng placeholder dạng <code>{'{{ten_bien}}'}</code>;{' '}
            {TEMPLATE_STORAGE_MODE === 'supabase'
              ? 'template dùng chung qua Supabase.'
              : 'template lưu riêng trên trình duyệt.'}
          </p>
        </div>
        <div className="template-topline-actions">
          <input
            ref={importInputRef}
            className="template-import-input"
            type="file"
            accept="application/json,.json"
            onChange={importTemplates}
          />
          <button
            className="outline-button"
            type="button"
            onClick={() => importInputRef.current?.click()}
            disabled={saving}
          >
            <span className="button-icon" aria-hidden="true">
              ↥
            </span>
            Import JSON
          </button>
          <button
            className="outline-button"
            type="button"
            onClick={exportTemplate}
            disabled={saving || !content.trim()}
          >
            <span className="button-icon" aria-hidden="true">
              ↧
            </span>
            Export JSON
          </button>
          <button
            className="secondary-button new-template-button"
            type="button"
            onClick={createTemplate}
            disabled={saving}
          >
            <span className="button-icon" aria-hidden="true">
              ＋
            </span>
            Tạo template
          </button>
        </div>
      </div>
      <div className="template-library">
        <div className="template-library-heading">
          <label htmlFor="template-select">Template library</label>
          <small>{templates.length} template</small>
        </div>
        <select
          id="template-select"
          className="template-select"
          value={selectedId === 'new' ? '' : selectedId}
          onChange={(event) => {
            const template = templates.find((item) => item.id === event.target.value);
            if (template) loadTemplate(template);
          }}
        >
          {selectedId === 'new' && <option value="">Template mới chưa lưu</option>}
          {templates.map((template) => (
            <option value={template.id} key={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <p className="template-selected-description">
          {selected?.description || 'Template cá nhân'}
        </p>
      </div>
      <div className="template-editor">
        {notice && (
          <p className="template-global-notice" role="status">
            {notice}
          </p>
        )}
        <div className="template-mode-switch" role="tablist" aria-label="Template workspace mode">
          <button
            className={activeMode === 'values' ? 'template-mode active' : 'template-mode'}
            type="button"
            role="tab"
            aria-selected={activeMode === 'values'}
            onClick={() => setActiveMode('values')}
          >
            <span className="button-icon" aria-hidden="true">
              ✎
            </span>
            Nhập giá trị
          </button>
          <button
            className={activeMode === 'details' ? 'template-mode active' : 'template-mode'}
            type="button"
            role="tab"
            aria-selected={activeMode === 'details'}
            onClick={() => setActiveMode('details')}
          >
            <span className="button-icon" aria-hidden="true">
              ⚙
            </span>
            Template details
          </button>
        </div>
        <div className="template-workbench">
          <div className="template-control-column">
            {activeMode === 'details' && (
              <SectionCard
                className="template-compose"
                title="Template details"
                meta={selected?.builtIn ? 'Mặc định' : 'Cá nhân'}
              >
                <div>
                  <div className="template-meta">
                    <label htmlFor="template-name">
                      Tên template
                      <input
                        id="template-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Ví dụ: Release report"
                      />
                    </label>
                    <label htmlFor="template-description">
                      Mô tả
                      <input
                        id="template-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Template dùng cho..."
                      />
                    </label>
                  </div>
                  <label className="template-content-label" htmlFor="template-content">
                    Nội dung template
                    <textarea
                      id="template-content"
                      className="template-content"
                      value={content}
                      onChange={(event) => updateContent(event.target.value)}
                      placeholder="Viết nội dung và dùng {{placeholder}}..."
                      rows={12}
                    />
                  </label>
                  <div className="template-editor-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={saveTemplate}
                      disabled={saving}
                    >
                      <span className="button-icon" aria-hidden="true">
                        {saving ? '…' : '✓'}
                      </span>
                      {saving ? 'Đang lưu...' : 'Lưu template'}
                    </button>
                    {selected && !selected.builtIn && (
                      <button
                        className="danger-button"
                        type="button"
                        onClick={deleteTemplate}
                        disabled={saving}
                      >
                        <span className="button-icon" aria-hidden="true">
                          ×
                        </span>
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}
            {activeMode === 'values' && (
              <SectionCard
                className="template-values"
                title="Nhập giá trị"
                meta={`${variables.length} placeholder · giá trị không được gửi lên server`}
              >
                <div className="template-values-grid">
                  {variables.length ? (
                    variables.map((variable) => (
                      <label key={variable}>
                        {formatVariableName(variable)}
                        <textarea
                          value={values[variable] ?? ''}
                          onChange={(event) =>
                            setValues((current) => ({ ...current, [variable]: event.target.value }))
                          }
                          rows={
                            variable.includes('summary') ||
                            variable.includes('message') ||
                            variable.includes('done') ||
                            variable.includes('remaining') ||
                            variable.includes('confirmation')
                              ? 3
                              : 1
                          }
                          placeholder="Có thể để trống"
                        />
                      </label>
                    ))
                  ) : (
                    <p className="empty-state">
                      Thêm placeholder vào nội dung để xuất hiện ô nhập.
                    </p>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
          <SectionCard
            className="template-preview"
            title="Preview"
            meta="Nội dung sau khi thay placeholder"
            action={
              <button className="copy-button" type="button" onClick={copyRendered}>
                <span className="button-icon" aria-hidden="true">
                  {copied ? '✓' : '⧉'}
                </span>
                {copied ? 'Đã copy' : 'Copy text'}
              </button>
            }
          >
            <pre>{rendered || 'Preview sẽ hiển thị ở đây.'}</pre>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
