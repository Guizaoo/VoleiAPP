import { priceRanges } from '../config/site';
import type { CourtFilters, CoverageFilter, ModalityFilter } from '../types/court';
import { ChipGroup } from './ChipGroup';
import styles from './FiltersForm.module.css';

interface FiltersFormProps {
  filters: CourtFilters;
  neighborhoods: string[];
  onChange: (patch: Partial<CourtFilters>) => void;
  idPrefix: string;
}

export const modalityOptions: { value: ModalityFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'indoor', label: 'Quadra' },
  { value: 'beach', label: 'Areia' },
];

const coverageOptions: { value: CoverageFilter; label: string }[] = [
  { value: 'all', label: 'Tanto faz' },
  { value: 'covered', label: 'Coberta' },
  { value: 'uncovered', label: 'Descoberta' },
];

export function FiltersForm({ filters, neighborhoods, onChange, idPrefix }: FiltersFormProps) {
  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-bairro`} className={styles.label}>
          Bairro
        </label>
        <select
          id={`${idPrefix}-bairro`}
          className={styles.select}
          value={filters.neighborhood}
          onChange={(e) => onChange({ neighborhood: e.target.value })}
        >
          <option value="">Todos os bairros</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <ChipGroup
        legend="Modalidade"
        options={modalityOptions}
        value={filters.modality}
        onChange={(modality) => onChange({ modality })}
      />

      <ChipGroup
        legend="Preço por hora"
        options={priceRanges.map((r) => ({ value: r.id, label: r.label }))}
        value={filters.priceRangeId}
        onChange={(priceRangeId) => onChange({ priceRangeId })}
      />

      <ChipGroup
        legend="Cobertura"
        options={coverageOptions}
        value={filters.coverage}
        onChange={(coverage) => onChange({ coverage })}
      />
    </div>
  );
}
