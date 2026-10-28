import { siteConfig } from '../config/site';
import { fromISODate, isToday, isTomorrow } from './dates';

const currencyFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: 'currency',
  currency: siteConfig.currency,
});

const currencyNoCentsFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: 'currency',
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** R$ 160,00 */
export function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

/** R$ 160 quando não há centavos; R$ 185,50 caso contrário. */
export function formatPriceShort(cents: number): string {
  return cents % 100 === 0 ? currencyNoCentsFormatter.format(cents / 100) : formatCurrency(cents);
}

/** 19:00 */
export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/** 19:00 – 20:00 */
export function formatTimeRange(startHour: number, durationMinutes: number): string {
  const endMinutes = startHour * 60 + durationMinutes;
  const endH = Math.floor(endMinutes / 60) % 24;
  const endM = endMinutes % 60;
  return `${formatHour(startHour)} – ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return h === 1 ? '1 hora' : `${h} horas`;
  }
  return `${minutes} min`;
}

/** 27/10/2026 */
export function formatDateShort(iso: string): string {
  return fromISODate(iso).toLocaleDateString(siteConfig.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** terça-feira, 27 de outubro */
export function formatDateLong(iso: string): string {
  return fromISODate(iso).toLocaleDateString(siteConfig.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Rótulos compactos para o seletor de datas: { weekday: 'Hoje', day: '27', month: 'out' }. */
export function formatDateChip(iso: string, now: Date) {
  const date = fromISODate(iso);
  const weekday = isToday(iso, now)
    ? 'Hoje'
    : isTomorrow(iso, now)
      ? 'Amanhã'
      : capitalize(date.toLocaleDateString(siteConfig.locale, { weekday: 'short' }).replace('.', ''));
  return {
    weekday,
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleDateString(siteConfig.locale, { month: 'short' }).replace('.', ''),
  };
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "hoje", "amanhã" ou "qua, 29/10" — usado em frases curtas. */
export function formatRelativeDay(iso: string, now: Date): string {
  if (isToday(iso, now)) return 'hoje';
  if (isTomorrow(iso, now)) return 'amanhã';
  const date = fromISODate(iso);
  const weekday = date.toLocaleDateString(siteConfig.locale, { weekday: 'short' }).replace('.', '');
  const dayMonth = date.toLocaleDateString(siteConfig.locale, { day: '2-digit', month: '2-digit' });
  return `${weekday}, ${dayMonth}`;
}

/** "agora", "há 5 min", "há 3 h", "há 2 dias". */
export function formatTimeAgo(minutes: number): string {
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'há 1 dia' : `há ${days} dias`;
}

/** 1.234 → "1.234"; 12.400 → "12,4 mil". */
export function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toLocaleString(siteConfig.locale, { maximumFractionDigits: 1 })} mil`;
  return n.toLocaleString(siteConfig.locale);
}
