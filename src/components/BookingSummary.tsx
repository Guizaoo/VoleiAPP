import { CalendarDays, Clock, MapPin, Timer, Wallet } from 'lucide-react';
import { siteConfig } from '../config/site';
import { formatCurrency, formatDateLong, formatDateShort, formatDuration, formatTimeRange } from '../lib/format';
import type { Court, TimeSlot } from '../types/court';
import styles from './BookingSummary.module.css';

interface BookingSummaryProps {
  court: Court;
  date: string;
  slot: TimeSlot | null;
  title?: string;
  variant?: 'default' | 'plain';
}

export function BookingSummary({ court, date, slot, title = 'Resumo da reserva', variant = 'default' }: BookingSummaryProps) {
  const duration = slot?.durationMinutes ?? siteConfig.sessionDurationMinutes;
  const total = slot ? Math.round((court.pricePerHourCents * duration) / 60) : null;

  return (
    <section className={`${styles.summary} ${variant === 'plain' ? styles.plain : ''}`} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      <dl className={styles.list}>
        <div>
          <dt>
            <MapPin size={16} aria-hidden="true" /> Quadra
          </dt>
          <dd>
            {court.name}
            <span className={styles.sub}>{court.neighborhood}</span>
          </dd>
        </div>
        <div>
          <dt>
            <CalendarDays size={16} aria-hidden="true" /> Data
          </dt>
          <dd>
            {formatDateShort(date)}
            <span className={styles.sub}>{formatDateLong(date)}</span>
          </dd>
        </div>
        <div>
          <dt>
            <Clock size={16} aria-hidden="true" /> Horário
          </dt>
          <dd className={slot ? undefined : styles.pending}>
            {slot ? formatTimeRange(slot.startHour, slot.durationMinutes) : 'Escolha um horário'}
          </dd>
        </div>
        <div>
          <dt>
            <Timer size={16} aria-hidden="true" /> Duração
          </dt>
          <dd>{formatDuration(duration)}</dd>
        </div>
        <div className={styles.total}>
          <dt>
            <Wallet size={16} aria-hidden="true" /> Total
          </dt>
          <dd>{total !== null ? formatCurrency(total) : '—'}</dd>
        </div>
      </dl>
    </section>
  );
}
