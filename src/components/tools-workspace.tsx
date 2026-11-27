'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LinkShortener } from '@/components/link-shortener';
import { TemplateBuilder } from '@/components/template-builder';

type Tool = 'home' | 'links' | 'templates';

export function ToolsWorkspace() {
  const [tool, setTool] = useState<Tool>('home');

  return (
    <div className="tools-shell">
      <header className="tools-header">
        <Link className="brand" href="/" aria-label="TeamKit, về trang chủ" onClick={() => setTool('home')}><span className="brand-mark" aria-hidden="true">T</span><span>Team<span className="brand-light">Kit</span></span></Link>
        <nav className="tools-nav" aria-label="Workspace tools">
          <button className={tool === 'home' ? 'tool-nav-item active' : 'tool-nav-item'} type="button" aria-current={tool === 'home' ? 'page' : undefined} onClick={() => setTool('home')}><span className="tool-nav-icon" aria-hidden="true">⌂</span><span><strong>Tools</strong><small>All tools</small></span></button>
          <button className={tool === 'links' ? 'tool-nav-item active' : 'tool-nav-item'} type="button" aria-current={tool === 'links' ? 'page' : undefined} onClick={() => setTool('links')}><span className="tool-nav-icon" aria-hidden="true">↗</span><span><strong>Link tools</strong><small>Single & bulk</small></span></button>
          <button className={tool === 'templates' ? 'tool-nav-item active' : 'tool-nav-item'} type="button" aria-current={tool === 'templates' ? 'page' : undefined} onClick={() => setTool('templates')}><span className="tool-nav-icon" aria-hidden="true">▤</span><span><strong>Templates</strong><small>Chatwork & text</small></span></button>
        </nav>
        <span className="internal-badge"><span className="internal-dot" aria-hidden="true" />INTERNAL TOOLKIT</span>
      </header>
      <main className="tools-layout">
        <section className="tool-main">
          {tool === 'home' ? <ToolCatalog onOpenTool={setTool} /> : tool === 'links' ? <><div className="tool-heading"><span className="tool-kicker">LINK TOOL</span><h1>Rút gọn và chia sẻ nhanh.</h1><p>Tạo một link, nhiều link hoặc report có thể gửi ngay cho team.</p></div><LinkShortener /></> : <TemplateBuilder />}
        </section>
      </main>
      <footer className="tools-footer"><span>Built for internal workflows</span><span>Author: <a href="https://github.com/tqt97" target="_blank" rel="noreferrer">TuanTQ <span aria-hidden="true">↗</span></a></span></footer>
    </div>
  );
}

function ToolCatalog({ onOpenTool }: { onOpenTool: (tool: Tool) => void }) {
  return <div className="catalog-page"><div className="catalog-hero"><span className="tool-kicker">TEAM WORKSPACE</span><h1>Công cụ nhỏ.<br /><span>Nhịp làm việc gọn hơn.</span></h1><p>Chọn một tool để bắt đầu. Mọi thứ ở đây được thiết kế cho những việc team lặp lại mỗi ngày.</p></div><div className="catalog-grid"><button className="catalog-card" type="button" onClick={() => onOpenTool('links')}><span className="catalog-icon link-icon">↗</span><span className="catalog-card-copy"><strong>Rút gọn link</strong><small>Một link hoặc nhiều link cùng lúc, có report label để copy và gửi.</small></span><span className="catalog-arrow" aria-hidden="true">→</span></button><button className="catalog-card" type="button" onClick={() => onOpenTool('templates')}><span className="catalog-icon template-icon">▤</span><span className="catalog-card-copy"><strong>Template trả lời</strong><small>Tạo text từ template Chatwork hoặc template riêng của team.</small></span><span className="catalog-arrow" aria-hidden="true">→</span></button><div className="catalog-card coming-soon"><span className="catalog-icon soon-icon">＋</span><span className="catalog-card-copy"><strong>Tool tiếp theo</strong><small>Thêm các tiện ích nội bộ khác vào TeamKit khi cần.</small></span><span className="coming-label">COMING SOON</span></div></div><p className="catalog-footnote">{`{{workspace}}`} · Internal use only</p></div>;
}
