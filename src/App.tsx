import { useCallback, useEffect, useMemo, useState } from 'react';
import { CourtDetails } from './components/CourtDetails';
import { CourtExplorer } from './components/CourtExplorer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { OwnersSection } from './components/OwnersSection';
import { FeedPage } from './components/social/FeedPage';
import { RankingPage } from './components/social/RankingPage';
import { siteConfig } from './config/site';
import { useFeed } from './hooks/useFeed';
import { useNow } from './hooks/useNow';
import { useRoute, type Route } from './hooks/useRoute';
import { getDefaultDate } from './lib/availability';
import { getBookableDates, toISODate } from './lib/dates';
import { defaultFilters, filterCourts, getNeighborhoods } from './lib/filters';
import { scrollToSection } from './lib/scroll';
import { courtsService } from './services/courtsService';
import type { BookingSelection, CourtFilters, Modality } from './types/court';

const allCourts = courtsService.listCourts();
const neighborhoods = getNeighborhoods(allCourts);

const pageTitles: Record<Route, string> = {
  quadras: `${siteConfig.name} · ${siteConfig.tagline}`,
  feed: `Feed · ${siteConfig.name}`,
  ranking: `Ranking · ${siteConfig.name}`,
};

interface ScrollTarget {
  hash: string;
  focusSelector?: string;
}

export default function App() {
  const { route, navigate } = useRoute();
  const feed = useFeed();
  const [scrollTarget, setScrollTarget] = useState<ScrollTarget | null>(null);
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

  /** Troca de aba e, depois de renderizar, rola até a seção (ou ao topo) e move o foco. */
  const go = useCallback(
    (next: Route, hash = '', focusSelector?: string) => {
      navigate(next, hash);
      setScrollTarget({ hash, focusSelector });
    },
    [navigate],
  );

  useEffect(() => {
    if (!scrollTarget) return;
    if (scrollTarget.hash) {
      scrollToSection(scrollTarget.hash.slice(1), scrollTarget.focusSelector);
    } else {
      window.scrollTo(0, 0);
      document.getElementById('conteudo')?.focus({ preventScroll: true });
    }
  }, [scrollTarget]);

  useEffect(() => {
    document.title = pageTitles[route];
  }, [route]);

  const goToExplorer = () => go('quadras', '#quadras', '#explorer-search');

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
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Header route={route} onNavigate={(next) => go(next)} />
      {route === 'feed' && (
        <FeedPage feed={feed} onOpenCourt={(id) => openCourt(id)} onSeeRanking={() => go('ranking')} />
      )}
      {route === 'ranking' && <RankingPage />}
      {route === 'quadras' && (
        <main id="conteudo" tabIndex={-1}>
          <Hero
            onSearch={(query) => {
              setFilters({ ...defaultFilters, query });
              goToExplorer();
            }}
            onPickModality={(modality: Modality) => {
              setFilters({ ...defaultFilters, modality });
              go('quadras', '#quadras');
            }}
            onBrowse={() => go('quadras', '#quadras')}
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
      )}
      <Footer onNavigate={go} />

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
