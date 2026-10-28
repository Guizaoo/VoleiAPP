import type { Player } from '../types/social';

/**
 * Perfis FICTÍCIOS para demonstrar o feed e o ranking.
 * Não usam fotos de pessoas: o avatar é feito com as iniciais.
 */
export const players: Player[] = [
  { id: 'ana-luiza', name: 'Ana Luiza M.', handle: 'analu.volei', neighborhood: 'Calhau', favoriteModality: 'beach', avatarColor: '#0b8043', season: { beach: { games: 64, wins: 46 }, indoor: { games: 12, wins: 7 } } },
  { id: 'bruno-c', name: 'Bruno C.', handle: 'brunocorte', neighborhood: 'Cohama', favoriteModality: 'beach', avatarColor: '#c2410c', season: { beach: { games: 58, wins: 39 }, indoor: { games: 20, wins: 12 } } },
  { id: 'carla-s', name: 'Carla S.', handle: 'carla.levanta', neighborhood: 'Renascença', favoriteModality: 'indoor', avatarColor: '#1d4ed8', season: { beach: { games: 10, wins: 5 }, indoor: { games: 52, wins: 38 } } },
  { id: 'diego-r', name: 'Diego R.', handle: 'diegoataque', neighborhood: 'Turu', favoriteModality: 'beach', avatarColor: '#7c3aed', season: { beach: { games: 61, wins: 35 }, indoor: { games: 8, wins: 3 } } },
  { id: 'elisa-p', name: 'Elisa P.', handle: 'elisa.bloqueio', neighborhood: 'Barreto', favoriteModality: 'indoor', avatarColor: '#be123c', season: { beach: { games: 6, wins: 2 }, indoor: { games: 48, wins: 33 } } },
  { id: 'felipe-a', name: 'Felipe A.', handle: 'felipe.saque', neighborhood: "Ponta d'Areia", favoriteModality: 'beach', avatarColor: '#0e7490', season: { beach: { games: 70, wins: 40 }, indoor: { games: 4, wins: 1 } } },
  { id: 'gabi-n', name: 'Gabi N.', handle: 'gabilibero', neighborhood: 'Vinhais', favoriteModality: 'indoor', avatarColor: '#a16207', season: { beach: { games: 22, wins: 13 }, indoor: { games: 40, wins: 26 } } },
  { id: 'hugo-t', name: 'Hugo T.', handle: 'hugo.manchete', neighborhood: 'Cohama', favoriteModality: 'beach', avatarColor: '#4d7c0f', season: { beach: { games: 45, wins: 24 }, indoor: { games: 15, wins: 9 } } },
  { id: 'isa-f', name: 'Isa F.', handle: 'isa.cortada', neighborhood: 'Olho d’Água', favoriteModality: 'beach', avatarColor: '#db2777', season: { beach: { games: 53, wins: 34 }, indoor: { games: 9, wins: 4 } } },
  { id: 'joao-v', name: 'João V.', handle: 'joaov.rede', neighborhood: 'Centro', favoriteModality: 'indoor', avatarColor: '#334155', season: { beach: { games: 14, wins: 6 }, indoor: { games: 44, wins: 25 } } },
  { id: 'kaio-b', name: 'Kaio B.', handle: 'kaio.pinga', neighborhood: 'Quintas do Calhau', favoriteModality: 'beach', avatarColor: '#0369a1', season: { beach: { games: 38, wins: 23 }, indoor: { games: 6, wins: 2 } } },
  { id: 'lara-m', name: 'Lara M.', handle: 'lara.levantadora', neighborhood: 'Renascença', favoriteModality: 'indoor', avatarColor: '#9333ea', season: { beach: { games: 18, wins: 11 }, indoor: { games: 36, wins: 24 } } },
];

export const playersById = Object.fromEntries(players.map((p) => [p.id, p])) as Record<string, Player>;
