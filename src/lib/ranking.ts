import type { Player, RankingEntry, RankingModality, RankingPeriod } from '../types/social';
import { seededRandom } from './random';

/** Regra ilustrativa de pontuação. */
export const POINTS_PER_WIN = 3;
export const POINTS_PER_GAME = 1;

export const periodLabels: Record<RankingPeriod, string> = {
  week: 'Semana',
  month: 'Mês',
  season: 'Temporada',
};

/** Fração da temporada jogada em cada período (determinística por jogador). */
function periodShare(playerId: string, period: RankingPeriod, offset: number): number {
  if (period === 'season') return 1;
  const r = seededRandom(`${playerId}|${period}|${offset}`);
  return period === 'week' ? 0.05 + r * 0.1 : 0.22 + r * 0.2;
}

function statsFor(player: Player, modality: RankingModality, period: RankingPeriod, offset: number) {
  const modalities = modality === 'all' ? (['beach', 'indoor'] as const) : [modality];
  let games = 0;
  let wins = 0;
  for (const m of modalities) {
    const share = periodShare(`${player.id}-${m}`, period, offset);
    const g = Math.round(player.season[m].games * share);
    // Aproveitamento varia um pouco de período para período.
    const rate = player.season[m].wins / Math.max(1, player.season[m].games);
    const jitter = period === 'season' ? 0 : (seededRandom(`${player.id}|${m}|${period}|w${offset}`) - 0.5) * 0.2;
    games += g;
    wins += Math.min(g, Math.max(0, Math.round(g * (rate + jitter))));
  }
  return { games, wins, points: wins * POINTS_PER_WIN + games * POINTS_PER_GAME };
}

function rank(players: Player[], modality: RankingModality, period: RankingPeriod, offset: number) {
  return players
    .map((player) => ({ player, ...statsFor(player, modality, period, offset) }))
    .filter((e) => e.games > 0)
    .sort((a, b) => b.points - a.points || b.wins - a.wins || a.player.name.localeCompare(b.player.name));
}

/**
 * Ranking FICTÍCIO calculado a partir dos dados locais.
 * A tendência compara com o período anterior (gerado com outra semente).
 */
export function computeRanking(players: Player[], modality: RankingModality, period: RankingPeriod): RankingEntry[] {
  const current = rank(players, modality, period, 0);
  const previous = period === 'season' ? current : rank(players, modality, period, 1);
  const previousPosition = new Map(previous.map((e, i) => [e.player.id, i + 1]));

  return current.map((entry, i) => ({
    ...entry,
    position: i + 1,
    trend: (previousPosition.get(entry.player.id) ?? i + 1) - (i + 1),
  }));
}
