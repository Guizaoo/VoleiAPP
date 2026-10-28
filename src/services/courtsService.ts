import { courts } from '../data/courts';
import { findSelectableSlot, getSlotsForDate } from '../lib/availability';
import type { Court, SimulatedBooking, TimeSlot } from '../types/court';

/**
 * Camada de acesso a dados.
 *
 * Hoje lê os dados fictícios locais de forma síncrona. Quando existir uma API
 * (Node.js + Express), estas funções passam a chamar os endpoints sugeridos
 * no README (GET /api/courts, GET /api/courts/:id/availability, POST /api/bookings)
 * e os componentes continuam consumindo os mesmos tipos de src/types.
 */
export const courtsService = {
  listCourts(): Court[] {
    return courts;
  },

  getCourt(courtId: string): Court | undefined {
    return courts.find((court) => court.id === courtId);
  },

  getAvailability(court: Court, date: string, now: Date): TimeSlot[] {
    return getSlotsForDate(court, date, now);
  },

  /**
   * Simula uma reserva. Não persiste nada e não realiza cobrança.
   * Retorna null se o horário deixou de estar disponível.
   */
  simulateBooking(court: Court, slotId: string, now: Date): SimulatedBooking | null {
    const slot = findSelectableSlot(court, slotId, now);
    if (!slot) return null;
    return {
      id: `demo-${slot.id}`,
      courtId: court.id,
      courtName: court.name,
      neighborhood: court.neighborhood,
      date: slot.date,
      startHour: slot.startHour,
      durationMinutes: slot.durationMinutes,
      totalCents: Math.round((court.pricePerHourCents * slot.durationMinutes) / 60),
      isSimulation: true,
    };
  },
};
