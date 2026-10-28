import { ArrowRight, Trophy } from 'lucide-react';
import type { RankingEntry } from '../../types/social';
import { Avatar } from './Avatar';
import { TrendBadge } from './TrendBadge';
import styles from './RankingWidget.module.css';

interface RankingWidgetProps {
  entries: RankingEntry[];
  onSeeAll: () => void;
  limit?: number;
}

/** Resumo do ranking da semana exibido ao lado do feed. */
export function RankingWidget({ entries, onSeeAll, limit = 5 }: RankingWidgetProps) {
  return (
    <section className={styles.widget} aria-labelledby="ranking-widget-title">
      <header className={styles.header}>
        <span className={styles.icon}>
          <Trophy size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 id="ranking-widget-title" className={styles.title}>
            Ranking da semana
          </h2>
          <p className={styles.subtitle}>Quadra e areia · pontos</p>
        </div>
      </header>

      <ol className={styles.list}>
        {entries.slice(0, limit).map((entry) => (
          <li key={entry.player.id} className={styles.row}>
            <span className={styles.position} data-top={entry.position <= 3 || undefined}>
              {entry.position}
            </span>
            <Avatar player={entry.player} size={34} />
            <span className={styles.who}>
              <strong>{entry.player.name}</strong>
              <span>{entry.player.neighborhood}</span>
            </span>
            <TrendBadge trend={entry.trend} />
            <span className={styles.points}>
              {entry.points}
              <span className="visually-hidden"> pontos</span>
              <span aria-hidden="true"> pts</span>
            </span>
          </li>
        ))}
      </ol>

      <button type="button" className={`btn btn-ghost btn-block ${styles.cta}`} onClick={onSeeAll}>
        Ver ranking completo
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </section>
  );
}
