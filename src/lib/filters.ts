import { priceRanges } from '../config/site';
import type { Court, CourtFilters } from '../types/court';

export const defaultFilters: CourtFilters = {
  query: '',
  neighborhood: '',
  modality: 'all',
  priceRangeId: 'all',
  coverage: 'all',
};

/** Remove acentos e caixa para que "agua" encontre "Água". */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function filterCourts(courts: Court[], filters: CourtFilters): Court[] {
  const query = normalizeText(filters.query);
  const range = priceRanges.find((r) => r.id === filters.priceRangeId);

  return courts.filter((court) => {
    if (query) {
      const haystack = normalizeText(`${court.name} ${court.neighborhood}`);
      if (!query.split(/\s+/).every((term) => haystack.includes(term))) return false;
    }
    if (filters.neighborhood && court.neighborhood !== filters.neighborhood) return false;
    if (filters.modality !== 'all' && court.modality !== filters.modality) return false;
    if (filters.coverage !== 'all' && court.coverage !== filters.coverage) return false;
    if (range) {
      if (court.pricePerHourCents < range.minCents) return false;
      if (range.maxCents !== null && court.pricePerHourCents > range.maxCents) return false;
    }
    return true;
  });
}

/** Quantos filtros do painel estão ativos (a busca por texto é contada à parte). */
export function countActiveFilters(filters: CourtFilters): number {
  return [
    filters.neighborhood !== defaultFilters.neighborhood,
    filters.modality !== defaultFilters.modality,
    filters.priceRangeId !== defaultFilters.priceRangeId,
    filters.coverage !== defaultFilters.coverage,
  ].filter(Boolean).length;
}

export function hasAnyFilter(filters: CourtFilters): boolean {
  return countActiveFilters(filters) > 0 || filters.query.trim() !== '';
}

export function getNeighborhoods(courts: Court[]): string[] {
  return [...new Set(courts.map((c) => c.neighborhood))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
