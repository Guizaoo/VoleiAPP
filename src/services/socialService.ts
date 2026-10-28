import { players, playersById } from '../data/players';
import { posts, stories } from '../data/posts';
import { computeRanking } from '../lib/ranking';
import type { Player, Post, RankingEntry, RankingModality, RankingPeriod, Story } from '../types/social';

/** Perfil usado quando o visitante cria uma postagem ou comentário na demonstração. */
export const visitor: Player = {
  id: 'voce',
  name: 'Você',
  handle: 'voce',
  neighborhood: '',
  favoriteModality: 'beach',
  avatarColor: '#13201a',
  season: { beach: { games: 0, wins: 0 }, indoor: { games: 0, wins: 0 } },
};

/**
 * Acesso aos dados sociais FICTÍCIOS. Na versão com API, estas funções
 * passam a chamar GET /api/feed, GET /api/stories e GET /api/ranking.
 */
export const socialService = {
  listPosts(): Post[] {
    return posts;
  },
  listStories(): Story[] {
    return stories;
  },
  getPlayer(playerId: string): Player {
    return playerId === visitor.id ? visitor : playersById[playerId];
  },
  getRanking(modality: RankingModality, period: RankingPeriod): RankingEntry[] {
    return computeRanking(players, modality, period);
  },
};
