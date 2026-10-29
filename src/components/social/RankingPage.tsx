import { useMemo, useState } from 'react';
import { Info, Medal, ChevronDown, ChevronRight, Gift } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { modalityLabels } from '../../data/labels';
import { periodLabels, POINTS_PER_GAME, POINTS_PER_WIN } from '../../lib/ranking';
import { socialService } from '../../services/socialService';
import type { RankingModality, RankingPeriod } from '../../types/social';
import { ChipGroup } from '../ChipGroup';
import { Dialog } from '../Dialog';
import { Avatar } from './Avatar';
import { TrendBadge } from './TrendBadge';
import styles from './RankingPage.module.css';

const periodOptions: { value: RankingPeriod; label: string }[] = [
  { value: 'week', label: 'Semanal' },
  { value: 'month', label: 'Mensal' },
];
const modalityOptions: { value: RankingModality; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'beach', label: 'Areia' },
  { value: 'indoor', label: 'Quadra' },
];

const weeklyPrizes = [
  { kind: 'bag', name: 'Ecobag Levanta', description: 'Do jogo para o dia a dia. Sua comunidade vai junto.' },
  { kind: 'pin', name: 'Pin Levanta', description: 'Um detalhe pequeno para uma grande paixão pelo vôlei.' },
  { kind: 'towel', name: 'Toalha Levanta', description: 'Sua parceira na quadra, na areia e no próximo jogo.' },
] as const;

function PrizeIllustration({ kind }: { kind: typeof weeklyPrizes[number]['kind'] }) {
  return (
    <svg className={styles.prizeArt} viewBox="0 0 240 180" aria-hidden="true">
      <ellipse cx="120" cy="158" rx="74" ry="9" fill="#173e2a" opacity=".09" />
      {kind === 'bag' && <>
        <path d="M78 61V46a42 42 0 0 1 84 0v15" fill="none" stroke="#b6a887" strokeWidth="10" />
        <path d="M61 54h118l10 101H51Z" fill="#eee2c6" stroke="#cbbd9d" strokeWidth="2" strokeLinejoin="round" />
        <path d="M70 59 62 149m108-90 8 90" stroke="#d7c9a8" strokeWidth="2" />
      </>}
      {kind === 'pin' && <>
        <circle cx="120" cy="89" r="61" fill="#b39041" />
        <circle cx="120" cy="86" r="58" fill="#e5c36e" />
        <circle cx="120" cy="86" r="51" fill="#174c34" stroke="#fff0bb" strokeWidth="2" />
      </>}
      {kind === 'towel' && <>
        <path d="m38 51 148-18 19 115-148 18Z" fill="#1c6241" stroke="#12482f" strokeWidth="2" />
        <path d="m45 65 143-18m-133 99 143-18" stroke="#cbe4b9" strokeWidth="5" />
        <path d="m58 166 1 7m10-8 1 7m10-8 1 7m10-8 1 7m10-8 1 7m10-8 1 7m10-8 1 7m10-8 1 7m10-8 1 7m10-8 1 7m10-8 1 7m10-8 1 7m10-8 1 7m10-8 1 7" stroke="#81ae8c" strokeWidth="2" />
      </>}
      <g fill="none" stroke={kind === 'bag' ? '#205739' : '#f7edce'} strokeWidth="3" strokeLinecap="round">
        <circle cx="120" cy="88" r="18" />
        <path d="M120 70c-4 9-3 18 3 27m-20 0c10 1 18-3 25-11m7 11c-7-6-16-8-25-6" />
      </g>
      <text x="120" y="125" textAnchor="middle" fill={kind === 'bag' ? '#205739' : '#f7edce'} fontSize="15" fontWeight="800" letterSpacing="2">LEVANTA</text>
    </svg>
  );
}

const podiumOrder = [1, 0, 2]; // 2º, 1º, 3º — o campeão no centro

function winRate(wins: number, games: number) {
  return games === 0 ? 0 : Math.round((wins / games) * 100);
}

export function RankingPage() {
  const [period, setPeriod] = useState<RankingPeriod>('week');
  const [selectedPrize, setSelectedPrize] = useState<{ name: string; description: string; place: number; kind?: typeof weeklyPrizes[number]['kind']; amount?: number } | null>(null);
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
        <p className={styles.lead}>Quem movimenta o vôlei dentro e fora das quadras em {siteConfig.city}.</p>
        <p className={styles.notice}>
          <Info size={15} aria-hidden="true" />
          Jogadores e resultados fictícios. Regra ilustrativa: {POINTS_PER_WIN} pontos por vitória + {POINTS_PER_GAME}{' '}
          por partida jogada.
        </p>
      </header>

      <section className={styles.rules} aria-labelledby="ranking-rules-title">
        <div className={styles.rulesHeading}>
          <h2 id="ranking-rules-title">Como funciona o ranking</h2>
          <span className={styles.seasonBadge}>Disputas semanais e mensais</span>
        </div>
        <p>Seu jogo conta. Sua participação na comunidade também. A proposta é somar o que você faz na quadra e no feed durante cada torneio.</p>
        <details className={styles.rulesDetails}>
          <summary>Ver regras do torneio</summary>
          <ol className={styles.rulesList}>
            <li><strong>Jogue e participe.</strong> As partidas disputadas e os resultados entram na pontuação do período.</li>
            <li><strong>Compartilhe seus jogos.</strong> Sempre que jogar, publique um story ou um post com foto da partida. Os registros dos jogos no feed também fazem parte da proposta de pontuação.</li>
            <li><strong>Movimente a comunidade.</strong> As interações nas publicações, como reações “Boa!” e comentários, compõem o engajamento considerado no ranking.</li>
            <li><strong>Dispute a semana e o mês.</strong> Cada semana tem sua classificação e seus prêmios. A disputa mensal considera os pontos acumulados no mês e tem a premiação maior.</li>
            <li><strong>Conquiste o pódio.</strong> Ao encerrar cada período, a pontuação define a classificação final. Os três primeiros da semana recebem os produtos abaixo. No mês, os prêmios são em Pix: R$ 200 para o 1º lugar, R$ 100 para o 2º e R$ 50 para o 3º.</li>
          </ol>
        </details>
      </section>

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

      <details className={styles.prizes}>
        <summary className={styles.prizesSummary}>
          <Gift size={21} aria-hidden="true" />
          <span><strong>{period === 'week' ? 'Premiação da semana' : 'Premiação do mês'}</strong><small>{period === 'week' ? 'Ecobag, pin e toalha Levanta' : 'R$ 200, R$ 100 e R$ 50 em Pix'}</small></span>
          <ChevronDown className={styles.expandIcon} size={20} aria-hidden="true" />
        </summary>
        <ol className={styles.prizeGrid}>
          {period === 'week' ? weeklyPrizes.map((prize, index) => (
            <li key={prize.kind} className={styles.prizeCard}>
              <button type="button" className={styles.prizeButton} onClick={() => setSelectedPrize({ ...prize, place: index + 1 })} aria-label={`Ver ${prize.name}, ${index + 1}º lugar`}>
                <PrizeIllustration kind={prize.kind} />
                <span className={styles.prizeLabel}><span className={styles.prizePlace}>{index + 1}º lugar</span><strong>{prize.name}</strong><small>Ver prêmio</small></span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </li>
          )) : [200, 100, 50].map((amount, index) => (
            <li key={amount} className={styles.prizeCard}>
              <button type="button" className={styles.prizeButton} onClick={() => setSelectedPrize({ name: `R$ ${amount} em Pix`, description: `Para o ${index + 1}º colocado no ranking do mês.`, place: index + 1, amount })} aria-label={`Ver prêmio de R$ ${amount}, ${index + 1}º lugar`}>
                <Medal className={styles.cashThumb} size={32} aria-hidden="true" />
                <span className={styles.prizeLabel}><span className={styles.prizePlace}>{index + 1}º lugar</span><strong>R$ {amount} em Pix</strong><small>Ver prêmio</small></span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        <p className={styles.prizeNote}>Proposta de premiação. {period === 'week' ? 'Ilustrações para demonstração.' : 'Premiação mensal em Pix.'}</p>
      </details>

      <Dialog variant="centered" open={selectedPrize !== null} onClose={() => setSelectedPrize(null)} titleId="prize-title" closeLabel="Fechar prêmio">
        {selectedPrize && <section className={styles.prizeDetail}>
          <span className={styles.seasonBadge}>{selectedPrize.place}º lugar · {selectedPrize.kind ? 'Semanal' : 'Mensal'}</span>
          <div className={styles.detailArt}>
            {selectedPrize.kind ? <PrizeIllustration kind={selectedPrize.kind} /> : <div className={styles.cashPrize}><Medal size={48} aria-hidden="true" /><strong>R$ {selectedPrize.amount}</strong></div>}
          </div>
          <h2 id="prize-title">{selectedPrize.name}</h2>
          <p>{selectedPrize.description}</p>
          <p className={styles.prizeNote}>Proposta de premiação{selectedPrize.kind ? '. Ilustração para demonstração.' : ' mensal em Pix.'}</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => setSelectedPrize(null)}>Voltar ao ranking</button>
        </section>}
      </Dialog>

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
