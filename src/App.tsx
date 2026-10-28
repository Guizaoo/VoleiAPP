import { useCallback, useMemo, useState } from 'react';
import { CourtDetails } from './components/CourtDetails';
import { CourtExplorer } from './components/CourtExplorer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { OwnersSection } from './components/OwnersSection';
import { useNow } from './hooks/useNow';
import { getDefaultDate } from './lib/availability';
import { getBookableDates, toISODate } from './lib/dates';
import { defaultFilters, filterCourts, getNeighborhoods } from './lib/filters';
import { scrollToSection } from './lib/scroll';
import { courtsService } from './services/courtsService';
import type { BookingSelection, CourtFilters, Modality } from './types/court';

const allCourts = courtsService.listCourts();
const neighborhoods = getNeighborhoods(allCourts);

export default function App() {
  const now = useNow();
  const today = toISODate(now);
  // Recalcula as datas apenas quando o dia muda.
  const dates = useMemo(() => getBookableDates(now), [today]);

  const [filters, setFilters] = useState<CourtFilters>(defaultFilters);
  const [exploreDate, setExploreDate] = useState(() => getDefaultDate(dates, allCourts, now));
  const [selection, setSelection] = useState<BookingSelection | null>(null);

  // Se a virada do dia tirar a data escolhida da janela, volta para a primeira disponível.
  const activeExploreDate = dates.includes(exploreDate) ? exploreDate : dates[0];
  const courts = useMemo(() => filterCourts(allCourts, filters), [filters]);
  const selectedCourt = selection ? courtsService.getCourt(selection.courtId) : undefined;

  const updateFilters = useCallback((patch: Partial<CourtFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const clearFilters = useCallback(() => setFilters(defaultFilters), []);

  const goToExplorer = () => scrollToSection('quadras', '#explorer-search');

  const openCourt = (courtId: string, slotId?: string) => {
    // Abrir outra quadra sempre começa uma seleção nova.
    setSelection({ courtId, date: activeExploreDate, slotId: slotId ?? null });
  };

  const changeSelectionDate = (date: string) => {
    // Um horário pertence a uma data: trocar a data limpa o horário.
    setSelection((current) => (current ? { ...current, date, slotId: null } : current));
  };

  const changeSelectionSlot = useCallback((slotId: string | null) => {
    setSelection((current) => (current ? { ...current, slotId } : current));
  }, []);

  return (
    <>
      <a href="#quadras" className="skip-link">
        Pular para as quadras
      </a>
      <Header onFindCourt={goToExplorer} />
      <main>
        <Hero
          onSearch={(query) => {
            setFilters({ ...defaultFilters, query });
            goToExplorer();
          }}
          onPickModality={(modality: Modality) => {
            setFilters({ ...defaultFilters, modality });
            scrollToSection('quadras');
          }}
          onBrowse={() => scrollToSection('quadras')}
        />
        <CourtExplorer
          courts={courts}
          filters={filters}
          neighborhoods={neighborhoods}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          dates={dates}
          date={activeExploreDate}
          onDateChange={setExploreDate}
          now={now}
          onOpenCourt={openCourt}
        />
        <HowItWorks />
        <OwnersSection />
      </main>
      <Footer />

      {selection && selectedCourt && (
        <CourtDetails
          key={selectedCourt.id}
          court={selectedCourt}
          date={dates.includes(selection.date) ? selection.date : dates[0]}
          slotId={selection.slotId}
          dates={dates}
          now={now}
          onDateChange={changeSelectionDate}
          onSlotChange={changeSelectionSlot}
          onClose={() => setSelection(null)}
        />
      )}
    </>
  );
}
