import type { Court } from '../types/court';
import { photos } from './photos';

/**
 * Locais de São Luís – MA encontrados em fontes públicas (veja `source` em cada um).
 * Apenas nome, bairro, endereço e estrutura citada nas fontes são reais e podem estar
 * desatualizados. Preços, horários, regras e disponibilidade são ILUSTRATIVOS.
 * As fotos são genéricas (não são dos locais) — origem e licenças no README.
 */


export const courts: Court[] = [
  {
    id: 'sports-village',
    name: 'Sports Village',
    neighborhood: 'Quintas do Calhau',
    addressHint: 'Av. Pres. Juscelino Kubitschek, 13',
    modality: 'beach',
    coverage: 'covered',
    pricePerHourCents: 13000,
    shortDescription: 'Complexo esportivo com quadra de areia coberta, para jogar faça sol ou chuva.',
    description:
      'Complexo esportivo nas Quintas do Calhau. Segundo fontes públicas, tem quadra coberta, recebe aulas de futevôlei e beach tennis e funciona todos os dias, das 6h às 22h.',
    highlights: ['Quadra coberta', 'Aberto todos os dias', 'Futevôlei'],
    amenities: ['covered', 'lighting', 'restroom'],
    rules: [
      'Chegue com 10 minutos de antecedência.',
      'Respeite o horário de término para o próximo grupo.',
      'Regras ilustrativas: confirme com o local.',
    ],
    photos: [photos.sandArena, photos.sandComplex],
    openingHours: { firstSessionHour: 6, lastSessionHour: 21 },
    source: { label: 'FilmaEu – Sports Village', url: 'https://filmaeu.com.br/parceiros/sports-village-sao-luis' },
    demoOccupancy: 0.5,
  },
  {
    id: 'arena-cf98',
    name: 'Arena CF98',
    neighborhood: 'Cohama',
    addressHint: 'Centro Fitness 98',
    modality: 'beach',
    coverage: 'uncovered',
    pricePerHourCents: 9000,
    shortDescription: 'Arena com várias quadras de areia, palco de desafios de vôlei e futevôlei.',
    description:
      'Arena do Centro Fitness 98, na Cohama. Uma reportagem de 2022 descreve 8 quadras de areia, vestiários, banheiros, bebedouros, restaurante e bar, com desafios de vôlei e futevôlei para iniciantes e avançados.',
    highlights: ['8 quadras', 'Vôlei e futevôlei', 'Restaurante e bar'],
    amenities: ['lighting', 'restroom', 'lockers', 'water', 'snackBar'],
    rules: [
      'Jogue descalço ou com meia própria para areia.',
      'Proibido vidro na área das quadras.',
      'Regras ilustrativas: confirme com o local.',
    ],
    photos: [photos.sandComplex, photos.sand],
    openingHours: { firstSessionHour: 6, lastSessionHour: 21 },
    source: {
      label: 'Jornal Pequeno (2022)',
      url: 'https://jornalpequeno.com.br/2022/10/07/desafios-de-volei-e-futevolei-movimentam-arena-cf98-em-sao-luis/',
    },
    demoOccupancy: 0.45,
  },
  {
    id: 'arena-lito-beach',
    name: 'Arena Lito Beach',
    neighborhood: 'Litorânea',
    addressHint: 'Av. Litorânea, dentro do Círculo Militar de São Luís',
    modality: 'beach',
    coverage: 'uncovered',
    pricePerHourCents: 11000,
    shortDescription: 'Arena de areia na Litorânea, sede de etapa do Maranhense de Beach Tennis.',
    description:
      'Arena de areia inaugurada no Círculo Militar, na Avenida Litorânea. Em 2026 recebeu uma etapa do Campeonato Maranhense Oficial de Beach Tennis.',
    highlights: ['Na Litorânea', 'Sede de torneios', 'Areia'],
    amenities: ['lighting', 'restroom', 'parking'],
    rules: [
      'Leve protetor solar e água nos horários de sol forte.',
      'Em caso de chuva forte, a reserva pode ser remarcada.',
      'Regras ilustrativas: confirme com o local.',
    ],
    photos: [photos.sandBeach, photos.sandSunset],
    openingHours: { firstSessionHour: 7, lastSessionHour: 21 },
    source: {
      label: 'Imirante (2026)',
      url: 'https://m.imirante.com/esporte/sao-luis/2026/08/10/beach-tennis-6-etapa-do-maranhense-ocorre-esta-semana',
    },
    demoOccupancy: 0.55,
  },
  {
    id: 'ct-neto-bruzaca',
    name: 'CT Neto Bruzaca',
    neighborhood: 'Turu',
    addressHint: 'Rua da Felicidade, 10 – Jardim Eldorado',
    modality: 'beach',
    coverage: 'uncovered',
    pricePerHourCents: 7000,
    shortDescription: 'Centro de treinamento de futevôlei no Jardim Eldorado, no Turu.',
    description:
      'Centro de treinamento de futevôlei comandado pelo professor Neto Bruzaca, no Jardim Eldorado (Turu), segundo uma lista de 2021 de lugares para praticar na cidade.',
    highlights: ['Futevôlei', 'Aulas', 'Areia'],
    amenities: ['lighting', 'water'],
    rules: [
      'Jogue descalço ou com meia própria para areia.',
      'Regras ilustrativas: confirme com o local.',
    ],
    photos: [photos.sand],
    openingHours: { firstSessionHour: 6, lastSessionHour: 20 },
    source: { label: 'Blog do Olivar (2021)', url: 'http://blogolivar.blogspot.com/2021/07/futevolei-onde-praticar-em-sao-luis-do.html' },
    demoOccupancy: 0.35,
  },
  {
    id: 'ct-professor-lucio',
    name: 'CT Professor Lúcio',
    neighborhood: "Ponta d'Areia",
    addressHint: 'Península da Ponta d’Areia, em frente ao posto salva-vidas',
    modality: 'beach',
    coverage: 'uncovered',
    pricePerHourCents: 6000,
    shortDescription: 'Treinos de futevôlei na areia da praia, na Península da Ponta d’Areia.',
    description:
      'Centro de treinamento de futevôlei na praia da Península da Ponta d’Areia, em frente ao posto salva-vidas, segundo uma lista de 2021 de lugares para praticar na cidade.',
    highlights: ['Pé na praia', 'Futevôlei', 'Melhor preço'],
    amenities: [],
    rules: [
      'Leve água e protetor solar.',
      'Em caso de chuva forte, a reserva pode ser remarcada.',
      'Regras ilustrativas: confirme com o local.',
    ],
    photos: [photos.sandSunset, photos.sandBeach],
    openingHours: { firstSessionHour: 6, lastSessionHour: 18 },
    source: { label: 'Blog do Olivar (2021)', url: 'http://blogolivar.blogspot.com/2021/07/futevolei-onde-praticar-em-sao-luis-do.html' },
    demoOccupancy: 0.3,
  },
  {
    id: 'ginasio-castelinho',
    name: 'Ginásio Castelinho',
    neighborhood: 'Barreto',
    addressHint: 'Complexo esportivo do Barreto',
    modality: 'indoor',
    coverage: 'covered',
    pricePerHourCents: 18000,
    shortDescription: 'Ginásio que recebe jogos de vôlei de alto nível em São Luís.',
    description:
      'Ginásio poliesportivo no Barreto que recebe partidas de vôlei de alto nível, como jogos da Superliga e da Supercopa. Não encontramos informação pública sobre aluguel: ele está aqui só para demonstrar uma quadra coberta.',
    highlights: ['Quadra oficial', 'Arquibancada', 'Jogos de Superliga'],
    amenities: ['covered', 'lighting', 'restroom', 'lockers', 'bleachers'],
    rules: [
      'Uso obrigatório de tênis de sola clara.',
      'Regras ilustrativas: confirme com o local.',
    ],
    photos: [photos.indoorStands, photos.indoorOrange, photos.gym],
    openingHours: { firstSessionHour: 8, lastSessionHour: 21 },
    source: {
      label: 'O Imparcial (2025)',
      url: 'https://oimparcial.com.br/noticias/2025/12/superliga-masculina-em-sao-luis-tera-confronto-direto-pela-lideranca-da-temporada/',
    },
    demoOccupancy: 0.6,
  },
];
