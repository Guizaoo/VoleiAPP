/** Modalidade da quadra. */
export type Modality = 'indoor' | 'beach';

/** Cobertura da quadra. */
export type Coverage = 'covered' | 'uncovered';

/** Comodidades disponíveis em um estabelecimento. */
export type AmenityId =
  | 'parking'
  | 'lighting'
  | 'restroom'
  | 'showers'
  | 'lockers'
  | 'covered'
  | 'water'
  | 'snackBar'
  | 'bleachers'
  | 'equipment'
  | 'accessibility';

export interface CourtPhoto {
  /** Caminho relativo a /public ou URL absoluta. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface OpeningHours {
  /** Hora (0–23) do início da primeira sessão. */
  firstSessionHour: number;
  /** Hora (0–23) do início da última sessão. */
  lastSessionHour: number;
}

export interface Court {
  /** Identificador estável, usado em URLs futuras e na API. */
  id: string;
  name: string;
  neighborhood: string;
  /** Endereço ilustrativo, sem número real. */
  addressHint: string;
  modality: Modality;
  coverage: Coverage;
  /** Preço por sessão de 1 hora, em centavos (evita erros de ponto flutuante). */
  pricePerHourCents: number;
  shortDescription: string;
  description: string;
  /** Destaques curtos exibidos no card. */
  highlights: string[];
  amenities: AmenityId[];
  rules: string[];
  photos: CourtPhoto[];
  openingHours: OpeningHours;
  /** De onde vieram nome e endereço (fonte pública). */
  source?: { label: string; url: string };
  /** Taxa de ocupação fictícia (0–1) usada para gerar disponibilidade. */
  demoOccupancy: number;
}

export type SlotStatus = 'available' | 'booked' | 'past';

export interface TimeSlot {
  /** Identificador estável: `${courtId}_${AAAA-MM-DD}_${HHmm}`. */
  id: string;
  courtId: string;
  /** Data local no formato ISO AAAA-MM-DD. */
  date: string;
  startHour: number;
  durationMinutes: number;
  status: SlotStatus;
}

/** Seleção em andamento no fluxo de reserva. */
export interface BookingSelection {
  courtId: string;
  date: string;
  slotId: string | null;
}

/** Resultado de uma reserva simulada. Nada é persistido nem cobrado. */
export interface SimulatedBooking {
  id: string;
  courtId: string;
  courtName: string;
  neighborhood: string;
  date: string;
  startHour: number;
  durationMinutes: number;
  totalCents: number;
  isSimulation: true;
}

export type ModalityFilter = 'all' | Modality;
export type CoverageFilter = 'all' | Coverage;

export interface CourtFilters {
  query: string;
  neighborhood: string;
  modality: ModalityFilter;
  priceRangeId: string;
  coverage: CoverageFilter;
}

export interface PriceRange {
  id: string;
  label: string;
  minCents: number;
  maxCents: number | null;
}
