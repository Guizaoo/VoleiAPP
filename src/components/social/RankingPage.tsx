import { useMemo, useState } from 'react';
import { Info, Medal } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { modalityLabels } from '../../data/labels';
import { periodLabels, POINTS_PER_GAME, POINTS_PER_WIN } from '../../lib/ranking';
import { socialService } from '../../services/socialService';
import type { RankingModality, RankingPeriod } from '../../types/social';
import { ChipGroup } from '../ChipGroup';
import { Avatar } from './Avatar';
import { TrendBadge } from './TrendBadge';
import styles from './RankingPage.module.css';

const periodOptions = (Object.keys(periodLabels) as RankingPeriod[]).map((value) => ({ value, label: periodLabels[value] }));
const modalityOptions: { value: RankingModality; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'beach', label: 'Areia' },
  { value: 'indoor', label: 'Quadra' },
];

const podiumOrder = [1, 0, 2]; // 2º, 1º, 3º — o campeão no centro

function winRate(wins: number, games: number) {
  return games === 0 ? 0 : Math.round((wins / games) * 100);
}

export function RankingPage() {
  const [period, setPeriod] = useState<RankingPeriod>('week');
  const [modality, setModality] = useState<RankingModality>('all');
  const entries = useMemo(() => socialService.getRanking(modality, period), [modality, period]);
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  const scope = `${periodLabels[period].toLowerCase()} · ${modality === 'all' ? 'todas as modalidades' : modalityLabels[modality].toLowerCase()}`;

  return (
    <main id="conteudo" className={`container ${styles.page}`} tabIndex={-1} aria-labelledby="ranking-title">
      <header className={styles.intro}>
        <h1 id="ranking-title" className={styles.title}>
          Ranking
        </h1>
        <p className={styles.lead}>Quem está jogando mais em {siteConfig.city}.</p>
        <p className={styles.notice}>
          <Info size={15} aria-hidden="true" />
          Jogadores e resultados fictícios. Regra ilustrativa: {POINTS_PER_WIN} pontos por vitória + {POINTS_PER_GAME}{' '}
          por partida jogada.
        </p>
      </header>

      <div className={styles.filters}>
        <ChipGroup legend="Período" hideLegend variant="segmented" options={periodOptions} value={period} onChange={setPeriod} />
        <ChipGroup
          legend="Modalidade"
          hideLegend
          variant="segmented"
          options={modalityOptions}
          value={modality}
          onChange={setModality}
        />
      </div>

      <p className={styles.scope} role="status">
        Mostrando: {scope}
      </p>

      <ol className={styles.podium} aria-label="Três primeiros colocados">
        {podiumOrder
          .filter((i) => podium[i])
          .map((i) => {
            const entry = podium[i];
            return (
              <li key={entry.player.id} className={styles.podiumItem} data-place={entry.position} value={entry.position}>
                <span className={styles.medal}>
                  <Medal size={16} aria-hidden="true" />
                  {entry.position}º
                </span>
                <Avatar player={entry.player} size={entry.position === 1 ? 68 : 54} />
                <strong className={styles.podiumName}>{entry.player.name}</strong>
                <span className={styles.podiumHood}>{entry.player.neighborhood}</span>
                <span className={styles.podiumPoints}>{entry.points} pts</span>
                <span className={styles.podiumStats}>
                  {entry.wins}V · {entry.games} jogos
                </span>
                <span className={styles.block} aria-hidden="true" />
              </li>
            );
          })}
      </ol>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className="visually-hidden">Classificação completa — {scope}</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Jogador</th>
              <th scope="col" className={styles.num}>
                Jogos
              </th>
              <th scope="col" className={`${styles.num} ${styles.optional}`}>
                Vitórias
              </th>
              <th scope="col" className={`${styles.num} ${styles.optional}`}>
                Aprov.
              </th>
              <th scope="col" className={styles.num}>
                Pontos
              </th>
            </tr>
          </thead>
          <tbody>
            {[...podium, ...rest].map((entry) => (
              <tr key={entry.player.id} data-top={entry.position <= 3 || undefined}>
                <td className={styles.pos}>
                  {entry.position}
                  <TrendBadge trend={entry.trend} />
                </td>
                <td>
                  <span className={styles.player}>
                    <Avatar player={entry.player} size={34} />
                    <span>
                      <strong>{entry.player.name}</strong>
                      <span className={styles.handle}>@{entry.player.handle}</span>
                    </span>
                  </span>
                </td>
                <td className={styles.num}>{entry.games}</td>
                <td className={`${styles.num} ${styles.optional}`}>{entry.wins}</td>
                <td className={`${styles.num} ${styles.optional}`}>{winRate(entry.wins, entry.games)}%</td>
                <td className={`${styles.num} ${styles.points}`}>{entry.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
