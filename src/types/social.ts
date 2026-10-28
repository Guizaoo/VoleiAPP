import type { Modality } from './court';

/** Perfil fictício da demonstração. */
export interface Player {
  id: string;
  name: string;
  handle: string;
  neighborhood: string;
  favoriteModality: Modality;
  /** Cor do avatar (iniciais), já que não usamos fotos de pessoas. */
  avatarColor: string;
  /** Estatísticas da temporada por modalidade. */
  season: Record<Modality, { games: number; wins: number }>;
}

export interface PostComment {
  id: string;
  playerId: string;
  text: string;
}

export interface PostImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Post {
  id: string;
  playerId: string;
  /** Quadra marcada na postagem (id de src/data/courts.ts). */
  courtId?: string;
  image?: PostImage;
  caption: string;
  /** Minutos antes de "agora", para o feed nunca parecer velho. */
  minutesAgo: number;
  likes: number;
  comments: PostComment[];
  /** Postagem criada pelo visitante nesta sessão (não é enviada a lugar nenhum). */
  isLocal?: boolean;
}

export interface Story {
  id: string;
  playerId: string;
  image: PostImage;
  caption: string;
  minutesAgo: number;
}

export type RankingPeriod = 'week' | 'month' | 'season';
export type RankingModality = 'all' | Modality;

export interface RankingEntry {
  position: number;
  player: Player;
  games: number;
  wins: number;
  points: number;
  /** Variação de posição em relação ao período anterior (positivo = subiu). */
  trend: number;
}
