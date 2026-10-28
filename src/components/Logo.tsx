import { siteConfig } from '../config/site';
import styles from './Logo.module.css';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={styles.mark}>
      <rect width="64" height="64" rx="16" fill="currentColor" />
      <circle cx="32" cy="32" r="17" fill="none" stroke="#fff" strokeWidth="4.5" />
      <path
        d="M32 15c-3 8-3 17 2 25M18 40c8 1 16-2 22-9M46 40c-6-5-14-7-23-5"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="49" cy="15" r="5" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`${styles.logo} ${inverted ? styles.inverted : ''}`}>
      <LogoMark />
      <span className={styles.word}>{siteConfig.name}</span>
    </span>
  );
}
