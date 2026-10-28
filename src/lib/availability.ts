import { siteConfig } from '../config/site';
import type { Court, TimeSlot } from '../types/court';
import { toISODate } from './dates';
import { seededRandom } from './random';

/**
 * Disponibilidade FICTÍCIA e determinística.
 * O mesmo par (quadra, data, hora) sempre gera o mesmo resultado, então a
 * disponibilidade se mantém consistente entre o card, os detalhes e o resumo.
 * Quando houver API, substitua getSlotsForDate pela resposta do back-end.
 */

export function buildSlotId(courtId: string, date: string, startHour: number): string {
  return `${courtId}_${date}_${String(startHour).padStart(2, '0')}00`;
}

function isBookedInDemo(court: Court, date: string, hour: number): boolean {
  // Horários do fim da tarde e da noite são mais procurados.
  const peak = hour >= 18 && hour <= 21 ? 0.2 : 0;
  const morningDip = hour < 9 ? -0.15 : 0;
  const chance = Math.min(0.9, Math.max(0.05, court.demoOccupancy + peak + morningDip));
  return seededRandom(`${court.id}|${date}|${hour}`) < chance;
}

/** Sessão já começou (ou passou) no dia de hoje. */
function isPast(date: string, hour: number, now: Date): boolean {
  const today = toISODate(now);
  if (date < today) return true;
  if (date > today) return false;
  return hour <= now.getHours();
}

export function getSlotsForDate(court: Court, date: string, now: Date): TimeSlot[] {
  const { firstSessionHour, lastSessionHour } = court.openingHours;
  const slots: TimeSlot[] = [];
  for (let hour = firstSessionHour; hour <= lastSessionHour; hour++) {
    const status = isPast(date, hour, now)
      ? 'past'
      : isBookedInDemo(court, date, hour)
        ? 'booked'
        : 'available';
    slots.push({
      id: buildSlotId(court.id, date, hour),
      courtId: court.id,
      date,
      startHour: hour,
      durationMinutes: siteConfig.sessionDurationMinutes,
      status,
    });
  }
  return slots;
}

export function getAvailableSlots(court: Court, date: string, now: Date): TimeSlot[] {
  return getSlotsForDate(court, date, now).filter((slot) => slot.status === 'available');
}

/** Retorna o horário se ele ainda puder ser selecionado; caso contrário, null. */
export function findSelectableSlot(court: Court, slotId: string | null, now: Date): TimeSlot | null {
  if (!slotId) return null;
  const [, date] = slotId.split('_');
  if (!date) return null;
  return getSlotsForDate(court, date, now).find((s) => s.id === slotId && s.status === 'available') ?? null;
}

/** Primeira data (hoje ou amanhã) que ainda tem horários a acontecer. */
export function getDefaultDate(dates: string[], courts: Court[], now: Date): string {
  const lastSession = Math.max(...courts.map((c) => c.openingHours.lastSessionHour));
  return now.getHours() >= lastSession && dates.length > 1 ? dates[1] : dates[0];
}
