import { useState } from 'react';
import { Info, RotateCcw, SearchX, Search, SlidersHorizontal } from 'lucide-react';
import { demoNotice } from '../config/site';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { countActiveFilters, hasAnyFilter } from '../lib/filters';
import { pluralize } from '../lib/format';
import type { Court, CourtFilters } from '../types/court';
import { ChipGroup } from './ChipGroup';
import { CourtCard } from './CourtCard';
import { DateStrip } from './DateStrip';
import { Dialog } from './Dialog';
import { FiltersForm, modalityOptions } from './FiltersForm';
import styles from './CourtExplorer.module.css';

interface CourtExplorerProps {
  courts: Court[];
  filters: CourtFilters;
  neighborhoods: string[];
  onFiltersChange: (patch: Partial<CourtFilters>) => void;
  onClearFilters: () => void;
  dates: string[];
  date: string;
  onDateChange: (date: string) => void;
  now: Date;
  onOpenCourt: (courtId: string, slotId?: string) => void;
}

export function CourtExplorer({
  courts,
  filters,
  neighborhoods,
  onFiltersChange,
  onClearFilters,
  dates,
  date,
  onDateChange,
  now,
  onOpenCourt,
}: CourtExplorerProps) {
  const isDesktop = useMediaQuery('(min-width: 960px)');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);
  const anyFilter = hasAnyFilter(filters);
  const resultText = `${pluralize(courts.length, 'quadra encontrada', 'quadras encontradas')}`;

  const searchField = (
    <div className={styles.searchField}>
      <label htmlFor="explorer-search" className="visually-hidden">
        Buscar por bairro ou nome da quadra
      </label>
      <Search size={18} className={styles.searchIcon} aria-hidden="true" />
      <input
        id="explorer-search"
        type="search"
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Bairro ou nome da quadra"
        value={filters.query}
        onChange={(e) => onFiltersChange({ query: e.target.value })}
      />
    </div>
  );

  return (
    <section id="quadras" className={`section ${styles.section}`} aria-labelledby="quadras-title" tabIndex={-1}>
      <div className="container">
        <header className={styles.header}>
          <h2 id="quadras-title" className="section-title">
            Encontre sua próxima quadra
          </h2>
          <p className={styles.notice}>
            <Info size={16} aria-hidden="true" />
            <span>{demoNotice}</span>
          </p>
        </header>

        <div className={styles.layout}>
          {isDesktop && (
            <aside className={styles.sidebar} aria-label="Filtros">
              <div className={styles.sidebarInner}>
                <p className={styles.sidebarTitle}>Filtros</p>
                {searchField}
                <FiltersForm
                  filters={filters}
                  neighborhoods={neighborhoods}
                  onChange={onFiltersChange}
                  idPrefix="sidebar"
                />
                {anyFilter && (
                  <button type="button" className="btn btn-ghost" onClick={onClearFilters}>
                    <RotateCcw size={16} aria-hidden="true" />
                    Limpar filtros
                  </button>
                )}
              </div>
            </aside>
          )}

          <div className={styles.main}>
            {!isDesktop && (
              <div className={styles.toolbar}>
                <div className={styles.toolbarRow}>
                  {searchField}
                  <button
                    type="button"
                    className={styles.filtersButton}
                    onClick={() => setFiltersOpen(true)}
                    aria-haspopup="dialog"
                  >
                    <SlidersHorizontal size={18} aria-hidden="true" />
                    Filtros
                    {activeCount > 0 && (
                      <span className={styles.badge}>
                        {activeCount}
                        <span className="visually-hidden"> ativos</span>
                      </span>
                    )}
                  </button>
                </div>
                <ChipGroup
                  legend="Modalidade"
                  hideLegend
                  variant="segmented"
                  options={modalityOptions.map((o) =>
                    o.value === 'all' ? o : { ...o, label: o.value === 'indoor' ? 'Vôlei de quadra' : 'Vôlei de areia' },
                  )}
                  value={filters.modality}
                  onChange={(modality) => onFiltersChange({ modality })}
                />
              </div>
            )}

            <DateStrip
              dates={dates}
              value={date}
              onChange={onDateChange}
              now={now}
              legend="Mostrar horários livres para"
            />

            <div className={styles.results}>
              <p className={styles.count} role="status" aria-live="polite">
                {resultText}
              </p>
              {anyFilter && (
                <button type="button" className={`btn btn-ghost ${styles.clear}`} onClick={onClearFilters}>
                  <RotateCcw size={16} aria-hidden="true" />
                  Limpar filtros
                </button>
              )}
            </div>

            {courts.length > 0 ? (
              <div className={styles.grid}>
                {courts.map((court) => (
                  <CourtCard key={court.id} court={court} date={date} now={now} onOpen={onOpenCourt} />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>
                  <SearchX size={28} aria-hidden="true" />
                </span>
                <h3>Nenhuma quadra com esses filtros</h3>
                <p>
                  {filters.query.trim()
                    ? `Não encontramos “${filters.query.trim()}”. Confira a grafia, busque por outro bairro ou remova alguns filtros.`
                    : 'Tente outro bairro, amplie a faixa de preço ou escolha outra modalidade.'}
                </p>
                <button type="button" className="btn btn-primary" onClick={onClearFilters}>
                  <RotateCcw size={18} aria-hidden="true" />
                  Limpar filtros e ver todas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isDesktop && (
        <Dialog
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          titleId="filters-title"
          closeLabel="Fechar filtros"
          footer={
            <div className={styles.sheetFooter}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClearFilters}
                disabled={activeCount === 0}
              >
                Limpar
              </button>
              <button type="button" className="btn btn-primary btn-block" onClick={() => setFiltersOpen(false)}>
                {courts.length === 0 ? 'Nenhuma quadra — ajustar' : `Ver ${pluralize(courts.length, 'quadra', 'quadras')}`}
              </button>
            </div>
          }
        >
          <div className={styles.sheetBody}>
            <h2 id="filters-title" className={styles.sheetTitle}>
              Filtros
            </h2>
            <FiltersForm filters={filters} neighborhoods={neighborhoods} onChange={onFiltersChange} idPrefix="sheet" />
          </div>
        </Dialog>
      )}
    </section>
  );
}
