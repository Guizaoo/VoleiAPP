import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import styles from './TrendBadge.module.css';

/** Variação de posição com ícone e texto (não depende só da cor). */
export function TrendBadge({ trend }: { trend: number }) {
  if (trend > 0) {
    return (
      <span className={`${styles.trend} ${styles.up}`}>
        <ArrowUp size={12} strokeWidth={3} aria-hidden="true" />
        {trend}
        <span className="visually-hidden"> {trend === 1 ? 'posição acima' : 'posições acima'}</span>
      </span>
    );
  }
  if (trend < 0) {
    return (
      <span className={`${styles.trend} ${styles.down}`}>
        <ArrowDown size={12} strokeWidth={3} aria-hidden="true" />
        {Math.abs(trend)}
        <span className="visually-hidden"> {trend === -1 ? 'posição abaixo' : 'posições abaixo'}</span>
      </span>
    );
  }
  return (
    <span className={styles.trend}>
      <Minus size={12} strokeWidth={3} aria-hidden="true" />
      <span className="visually-hidden">Mesma posição</span>
    </span>
  );
}
