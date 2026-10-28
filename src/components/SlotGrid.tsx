import { useId } from 'react';
import { Check, Clock, X } from 'lucide-react';
import type { TimeSlot } from '../types/court';
import { formatHour } from '../lib/format';
import styles from './SlotGrid.module.css';

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
}

const statusText = {
  available: 'Livre',
  booked: 'Ocupado',
  past: 'Encerrado',
} as const;

/**
 * Grade de horários. Cada horário é um radio nativo: ocupados e encerrados
 * ficam desabilitados e o status é escrito por extenso (não só pela cor).
 */
export function SlotGrid({ slots, selectedSlotId, onSelect }: SlotGridProps) {
  const name = useId();
  const legendId = useId();
  const availableCount = slots.filter((s) => s.status === 'available').length;
  const hasFuture = slots.some((s) => s.status !== 'past');

  return (
    <fieldset className={styles.fieldset} aria-describedby={legendId}>
      <legend className={styles.legend}>Horários</legend>
      <p id={legendId} className={styles.count} aria-live="polite">
        {availableCount === 0
          ? hasFuture
            ? 'Todos os horários desta data estão ocupados. Experimente outra data.'
            : 'Não há mais horários nesta data. Escolha outro dia.'
          : `${availableCount} ${availableCount === 1 ? 'horário livre' : 'horários livres'} · sessões de 1 hora`}
      </p>

      <ul className={styles.key} aria-hidden="true">
        <li>
          <span className={`${styles.swatch} ${styles.swatchFree}`} /> Livre
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.swatchBooked}`} /> Ocupado
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.swatchSelected}`} /> Selecionado
        </li>
      </ul>

      <div className={styles.grid}>
        {slots.map((slot) => {
          const selected = slot.id === selectedSlotId;
          const disabled = slot.status !== 'available';
          return (
            <label
              key={slot.id}
              className={styles.slot}
              data-status={slot.status}
              data-selected={selected}
              aria-disabled={disabled || undefined}
            >
              <input
                type="radio"
                className="visually-hidden"
                name={name}
                value={slot.id}
                checked={selected}
                disabled={disabled}
                onChange={() => onSelect(slot.id)}
                aria-label={`${formatHour(slot.startHour)}, ${selected ? 'selecionado' : statusText[slot.status].toLowerCase()}`}
              />
              <span className={styles.time} aria-hidden="true">
                {formatHour(slot.startHour)}
              </span>
              <span className={styles.status} aria-hidden="true">
                {selected ? (
                  <>
                    <Check size={14} strokeWidth={3} /> Escolhido
                  </>
                ) : slot.status === 'booked' ? (
                  <>
                    <X size={14} strokeWidth={2.5} /> Ocupado
                  </>
                ) : slot.status === 'past' ? (
                  <>
                    <Clock size={13} /> Encerrado
                  </>
                ) : (
                  'Livre'
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
