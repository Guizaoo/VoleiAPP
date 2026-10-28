import type { PriceRange } from '../types/court';

/**
 * Configurações centrais da demonstração.
 * Altere aqui o nome provisório, a cidade e os textos que mudam com frequência.
 */
export const siteConfig = {
  name: 'Levanta',
  tagline: 'Quadras de vôlei com horário na hora',
  /** Cidade exibida nos textos. Os bairros ficam em src/data/courts.ts. */
  city: 'São Luís',
  state: 'MA',
  locale: 'pt-BR',
  currency: 'BRL',
  /** Quantos dias a partir de hoje ficam disponíveis para simular reservas. */
  bookingWindowDays: 14,
  /** Duração fixa das sessões nesta primeira versão. */
  sessionDurationMinutes: 60,
  /** Quantos horários livres aparecem no card de cada quadra. */
  slotsPreviewCount: 4,
} as const;

export const cityLabel = siteConfig.state ? `${siteConfig.city} – ${siteConfig.state}` : siteConfig.city;

/** Faixas de preço por hora usadas no filtro. Valores em centavos. */
export const priceRanges: PriceRange[] = [
  { id: 'all', label: 'Qualquer preço', minCents: 0, maxCents: null },
  { id: 'ate-100', label: 'Até R$ 100', minCents: 0, maxCents: 10000 },
  { id: '100-150', label: 'R$ 100 a R$ 150', minCents: 10001, maxCents: 15000 },
  { id: 'acima-150', label: 'Acima de R$ 150', minCents: 15001, maxCents: null },
];

export const demoNotice =
  'Nomes e endereços vêm de fontes públicas e podem estar desatualizados. Fotos, preços e horários são ilustrativos, não representam disponibilidade real e não há parceria com os locais.';

export const simulationResultNotice = 'Esta é uma demonstração. Nenhuma reserva ou cobrança foi realizada.';
