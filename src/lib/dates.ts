import { siteConfig } from '../config/site';

/** Converte uma data para AAAA-MM-DD no fuso local do visitante. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Interpreta AAAA-MM-DD como data local (evita o deslocamento de fuso do `new Date(iso)`). */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

/** Datas reserváveis, sempre relativas ao dia de hoje. */
export function getBookableDates(now: Date, days: number = siteConfig.bookingWindowDays): string[] {
  return Array.from({ length: days }, (_, i) => toISODate(addDays(now, i)));
}

export function isToday(iso: string, now: Date): boolean {
  return iso === toISODate(now);
}

export function isTomorrow(iso: string, now: Date): boolean {
  return iso === toISODate(addDays(now, 1));
}
