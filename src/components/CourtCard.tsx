import { CalendarClock, MapPin } from 'lucide-react';
import { siteConfig } from '../config/site';
import { coverageLabels, modalityLabels } from '../data/labels';
import { getAvailableSlots } from '../lib/availability';
import { formatHour, formatPriceShort, formatRelativeDay } from '../lib/format';
import type { Court } from '../types/court';
import { CourtImage } from './CourtImage';
import styles from './CourtCard.module.css';

interface CourtCardProps {
  court: Court;
  date: string;
  now: Date;
  onOpen: (courtId: string, slotId?: string) => void;
}

export function CourtCard({ court, date, now, onOpen }: CourtCardProps) {
  const available = getAvailableSlots(court, date, now);
  const preview = available.slice(0, siteConfig.slotsPreviewCount);
  const remaining = available.length - preview.length;
  const dayText = formatRelativeDay(date, now);
  const titleId = `court-${court.id}-title`;

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <div className={styles.media}>
        <CourtImage photo={court.photos[0]} />
        <span className={styles.photoNote}>Foto ilustrativa</span>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${court.modality === 'beach' ? styles.beach : styles.indoor}`}>
            {modalityLabels[court.modality]}
          </span>
          <span className={styles.badge}>{coverageLabels[court.coverage]}</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.heading}>
          <h3 id={titleId} className={styles.name}>
            {court.name}
          </h3>
          <p className={styles.location}>
            <MapPin size={16} aria-hidden="true" />
            {court.neighborhood}
          </p>
        </div>

        <ul className={styles.highlights} aria-label="Características">
          {court.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>

        <div className={styles.slots}>
          <p className={styles.slotsTitle}>
            <CalendarClock size={16} aria-hidden="true" />
            {available.length > 0 ? `Livres ${dayText}` : `Sem horários livres ${dayText}`}
          </p>
          {preview.length > 0 ? (
            <ul className={styles.slotList}>
              {preview.map((slot) => (
                <li key={slot.id}>
                  <button
                    type="button"
                    className={styles.slotChip}
                    onClick={() => onOpen(court.id, slot.id)}
                    aria-label={`Escolher ${formatHour(slot.startHour)} na ${court.name}`}
                  >
                    {formatHour(slot.startHour)}
                  </button>
                </li>
              ))}
              {remaining > 0 && <li className={styles.more}>+{remaining}</li>}
            </ul>
          ) : (
            <p className={styles.noSlots}>Veja outras datas nos detalhes.</p>
          )}
        </div>

        <div className={styles.footer}>
          <p className={styles.price}>
            <strong>{formatPriceShort(court.pricePerHourCents)}</strong>
            <span>/hora</span>
          </p>
          <button type="button" className="btn btn-primary" onClick={() => onOpen(court.id)}>
            Ver horários
            <span className="visually-hidden"> da {court.name}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
