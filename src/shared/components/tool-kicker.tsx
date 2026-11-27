import type { ReactNode } from 'react';
import styles from '../styles/shared-ui.module.css';

type ToolKickerProps = {
  children: ReactNode;
  className?: string;
};

export function ToolKicker({ children, className = '' }: ToolKickerProps) {
  return <span className={`${styles.kicker} ${className}`}>{children}</span>;
}
