import Link from 'next/link';
import { LinkShortener } from '@/components/link-shortener';

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Link Gọn, về trang chủ">
          <span className="brand-mark" aria-hidden="true">g</span>
          <span>link<span className="brand-light">gọn</span></span>
        </Link>
        <span className="topbar-note"><span className="live-dot" />Miễn phí · Không cần tài khoản</span>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="eyebrow"><span className="sparkle" aria-hidden="true">✳</span> Chia sẻ dễ dàng hơn</div>
        <h1 id="hero-title">Đường dẫn dài?<br /><span>Gọn lại trong một chạm.</span></h1>
        <p className="hero-copy">Dán đường dẫn của bạn. Nhận link ngắn để chia sẻ ngay.</p>
        <LinkShortener />
        <div className="trust-row">
          <span><span className="check-icon">✓</span> Nhanh chóng</span>
          <span><span className="check-icon">✓</span> Dùng miễn phí</span>
          <span><span className="check-icon">✓</span> Không cần đăng ký</span>
        </div>
      </section>

      <section className="how-section" aria-labelledby="how-title">
        <div className="section-heading">
          <span className="section-kicker">THẬT ĐƠN GIẢN</span>
          <h2 id="how-title">Ba bước. Xong ngay.</h2>
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <div className="step-icon paste-icon" aria-hidden="true"><span>↳</span></div>
            <span className="step-number">01</span>
            <h3>Dán đường dẫn</h3>
            <p>Link bài viết, tài liệu, PR hay bất kỳ trang web nào.</p>
          </article>
          <article className="step-card">
            <div className="step-icon shorten-icon" aria-hidden="true"><span>⤳</span></div>
            <span className="step-number">02</span>
            <h3>Rút gọn tức thì</h3>
            <p>Một địa chỉ ngắn gọn, dễ nhớ và dễ gửi cho mọi người.</p>
          </article>
          <article className="step-card">
            <div className="step-icon share-icon" aria-hidden="true"><span>⌯</span></div>
            <span className="step-number">03</span>
            <h3>Sao chép & chia sẻ</h3>
            <p>Chạm để sao chép. Dán vào nhóm chat là xong.</p>
          </article>
        </div>
      </section>

      <footer className="footer">
        <Link className="brand footer-brand" href="/" aria-label="Link Gọn, về trang chủ"><span className="brand-mark" aria-hidden="true">g</span><span>link<span className="brand-light">gọn</span></span></Link>
        <span>Ít ký tự hơn. Chia sẻ nhanh hơn.</span>
      </footer>
    </main>
  );
}
