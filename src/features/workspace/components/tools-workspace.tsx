'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from '../styles/workspace.module.css';

const LinkShortener = dynamic(() => import('@/features/links/components/link-shortener').then((module) => module.LinkShortener), {
  loading: () => <div className={styles.toolLoading} role="status">Đang mở Link tools...</div>,
});
const TemplateBuilder = dynamic(() => import('@/features/templates/components/template-builder').then((module) => module.TemplateBuilder), {
  loading: () => <div className={styles.toolLoading} role="status">Đang mở Templates...</div>,
});

type Tool = 'home' | 'links' | 'templates';

export function ToolsWorkspace() {
  const [tool, setTool] = useState<Tool>('home');

  return (
    <div className={styles.toolsShell}>
      <header className={styles.toolsHeader}>
        <Link className={styles.brand} href="/" aria-label="TeamKit, về trang chủ" onClick={() => setTool('home')}><span className={styles.brandMark} aria-hidden="true">T</span><span>Team<span className={styles.brandLight}>Kit</span></span></Link>
        <nav className={styles.toolsNav} aria-label="Workspace tools">
          <button className={`${styles.toolNavItem} ${tool === 'home' ? styles.active : ''}`} type="button" aria-current={tool === 'home' ? 'page' : undefined} onClick={() => setTool('home')}><span className={styles.toolNavIcon} aria-hidden="true">⌂</span><span><strong>Tools</strong><small>All tools</small></span></button>
          <button className={`${styles.toolNavItem} ${tool === 'links' ? styles.active : ''}`} type="button" aria-current={tool === 'links' ? 'page' : undefined} onClick={() => setTool('links')}><span className={styles.toolNavIcon} aria-hidden="true">↗</span><span><strong>Link tools</strong><small>Single & bulk</small></span></button>
          <button className={`${styles.toolNavItem} ${tool === 'templates' ? styles.active : ''}`} type="button" aria-current={tool === 'templates' ? 'page' : undefined} onClick={() => setTool('templates')}><span className={styles.toolNavIcon} aria-hidden="true">▤</span><span><strong>Templates</strong><small>Chatwork & text</small></span></button>
        </nav>
        <span className={styles.internalBadge}><span className={styles.internalDot} aria-hidden="true" />INTERNAL TOOLKIT</span>
      </header>
      <main className={styles.toolsLayout}>
        <section className={styles.toolMain}>
          {tool === 'home' ? <ToolCatalog onOpenTool={setTool} /> : tool === 'links' ? <><div className={styles.toolHeading}><span className={styles.toolKicker}>LINK TOOL</span><h1>Rút gọn và chia sẻ nhanh.</h1><p>Tạo một link, nhiều link hoặc report có thể gửi ngay cho team.</p></div><LinkShortener /></> : <TemplateBuilder />}
        </section>
      </main>
      <footer className={styles.toolsFooter}><span>Built for internal workflows</span><span>Author: <a href="https://github.com/tqt97" target="_blank" rel="noreferrer">TuanTQ <span aria-hidden="true">↗</span></a></span></footer>
    </div>
  );
}

function ToolCatalog({ onOpenTool }: { onOpenTool: (tool: Tool) => void }) {
  return <div className={styles.catalogPage}><div className={styles.catalogHero}><span className={styles.toolKicker}>TEAM WORKSPACE</span><h1>Công cụ nhỏ.<br /><span>Nhịp làm việc gọn hơn.</span></h1><p>Chọn một tool để bắt đầu. Mọi thứ ở đây được thiết kế cho những việc team lặp lại mỗi ngày.</p></div><div className={styles.catalogGrid}><button className={styles.catalogCard} type="button" onClick={() => onOpenTool('links')}><span className={`${styles.catalogIcon} ${styles.linkIcon}`}>↗</span><span className={styles.catalogCardCopy}><strong>Rút gọn link</strong><small>Một link hoặc nhiều link cùng lúc, có report label để copy và gửi.</small></span><span className={styles.catalogArrow} aria-hidden="true">→</span></button><button className={styles.catalogCard} type="button" onClick={() => onOpenTool('templates')}><span className={`${styles.catalogIcon} ${styles.templateIcon}`}>▤</span><span className={styles.catalogCardCopy}><strong>Template trả lời</strong><small>Tạo text từ template Chatwork hoặc template riêng của team.</small></span><span className={styles.catalogArrow} aria-hidden="true">→</span></button><div className={`${styles.catalogCard} ${styles.comingSoon}`}><span className={`${styles.catalogIcon} ${styles.soonIcon}`}>＋</span><span className={styles.catalogCardCopy}><strong>Tool tiếp theo</strong><small>Thêm các tiện ích nội bộ khác vào TeamKit khi cần.</small></span><span className={styles.comingLabel}>COMING SOON</span></div></div><p className={styles.catalogFootnote}>{`{{workspace}}`} · Internal use only</p></div>;
}
