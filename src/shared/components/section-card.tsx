import type { ReactNode } from 'react';
import styles from '../styles/shared-ui.module.css';

type SectionCardProps = {
  title: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function SectionCard({ title, meta, action, className = '', children }: SectionCardProps) {
  return (
    <section className={`${styles.card} ${className}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleGroup}>
          <h2 className={styles.cardTitle}>{title}</h2>
          {meta && <span className={styles.cardMeta}>{meta}</span>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
