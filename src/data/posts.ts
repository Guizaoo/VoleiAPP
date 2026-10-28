import type { Post, Story } from '../types/social';
import { photos } from './photos';

/** Postagens FICTÍCIAS. O horário é relativo a "agora" para o feed não envelhecer. */
export const posts: Post[] = [
  {
    id: 'post-1',
    playerId: 'ana-luiza',
    courtId: 'arena-cf98',
    image: photos.sandComplex,
    caption: 'Rachão de quarta fechado! 4 sets e ninguém queria parar 🏐 Quem vem na próxima?',
    minutesAgo: 35,
    likes: 48,
    comments: [
      { id: 'c1', playerId: 'bruno-c', text: 'Próxima eu tô dentro!' },
      { id: 'c2', playerId: 'isa-f', text: 'Aquele último ponto foi absurdo 😂' },
    ],
  },
  {
    id: 'post-2',
    playerId: 'carla-s',
    courtId: 'ginasio-castelinho',
    image: photos.indoorStands,
    caption: 'Treino de levantamento hoje. Mão firme e pé no chão. Bora pra cima, time!',
    minutesAgo: 140,
    likes: 73,
    comments: [{ id: 'c3', playerId: 'lara-m', text: 'Que treino! Semana que vem eu volto.' }],
  },
  {
    id: 'post-3',
    playerId: 'felipe-a',
    courtId: 'ct-professor-lucio',
    image: photos.sandSunset,
    caption: 'Fim de tarde na Ponta d’Areia. Melhor quadra é a que tem pôr do sol de fundo 🌅',
    minutesAgo: 260,
    likes: 121,
    comments: [
      { id: 'c4', playerId: 'kaio-b', text: 'Vista sem igual' },
      { id: 'c5', playerId: 'diego-r', text: 'Amanhã cedo tem revanche, hein' },
      { id: 'c6', playerId: 'ana-luiza', text: '🔥🔥' },
    ],
  },
  {
    id: 'post-4',
    playerId: 'elisa-p',
    courtId: 'ginasio-castelinho',
    image: photos.indoorOrange,
    caption: 'Precisamos de mais 2 pro jogo de sábado às 9h. Nível intermediário. Chama no direct!',
    minutesAgo: 420,
    likes: 29,
    comments: [{ id: 'c7', playerId: 'joao-v', text: 'Eu e meu irmão podemos!' }],
  },
  {
    id: 'post-5',
    playerId: 'diego-r',
    courtId: 'ct-neto-bruzaca',
    image: photos.sand,
    caption: 'Dupla nova, mesma fome. Primeira vitória da semana no Turu ✅',
    minutesAgo: 900,
    likes: 64,
    comments: [],
  },
  {
    id: 'post-6',
    playerId: 'isa-f',
    courtId: 'arena-lito-beach',
    image: photos.sandBeach,
    caption: 'Litorânea com vento a favor hoje. Saque viajado entrou que foi uma beleza.',
    minutesAgo: 1500,
    likes: 87,
    comments: [{ id: 'c8', playerId: 'hugo-t', text: 'Esse vento ajuda até eu 😅' }],
  },
  {
    id: 'post-7',
    playerId: 'kaio-b',
    courtId: 'sports-village',
    image: photos.sandArena,
    caption: 'Choveu, mas a quadra coberta salvou o treino. Sem desculpa!',
    minutesAgo: 2600,
    likes: 52,
    comments: [],
  },
];

/** Stories FICTÍCIOS (expiram em 24 h na vida real; aqui ficam sempre recentes). */
export const stories: Story[] = [
  { id: 'story-1', playerId: 'ana-luiza', image: photos.sandComplex, caption: 'Aquecendo pro rachão', minutesAgo: 20 },
  { id: 'story-2', playerId: 'bruno-c', image: photos.sand, caption: 'Quadra livre às 19h, bora?', minutesAgo: 55 },
  { id: 'story-3', playerId: 'carla-s', image: photos.indoorOrange, caption: 'Rede montada ✅', minutesAgo: 90 },
  { id: 'story-4', playerId: 'felipe-a', image: photos.netSunset, caption: 'Hoje o céu caprichou', minutesAgo: 180 },
  { id: 'story-5', playerId: 'gabi-n', image: photos.gym, caption: 'Treino de defesa', minutesAgo: 240 },
  { id: 'story-6', playerId: 'isa-f', image: photos.sandBeach, caption: 'Vento forte na Litorânea', minutesAgo: 300 },
  { id: 'story-7', playerId: 'joao-v', image: photos.multiCourt, caption: 'Quadra da praça liberada', minutesAgo: 420 },
  { id: 'story-8', playerId: 'lara-m', image: photos.indoorStands, caption: 'Ginásio cheio hoje', minutesAgo: 600 },
];
