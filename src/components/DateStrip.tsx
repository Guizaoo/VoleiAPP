import { useEffect, useId, useRef } from 'react';
import { formatDateChip, formatDateLong } from '../lib/format';
import styles from './DateStrip.module.css';

interface DateStripProps {
  dates: string[];
  value: string;
  onChange: (date: string) => void;
  now: Date;
  legend: string;
  hideLegend?: boolean;
}

/** Seletor de datas em faixa com radios nativos (setas do teclado funcionam). */
export function DateStrip({ dates, value, onChange, now, legend, hideLegend = false }: DateStripProps) {
  const name = useId();
  const listRef = useRef<HTMLDivElement>(null);

  // Mantém a data escolhida visível dentro da faixa, sem mexer na rolagem da página.
  useEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>('[data-selected="true"]');
    if (!list || !selected) return;
    const listBox = list.getBoundingClientRect();
    const itemBox = selected.getBoundingClientRect();
    if (itemBox.left < listBox.left || itemBox.right > listBox.right) {
      list.scrollBy({ left: itemBox.left - listBox.left - listBox.width / 2 + itemBox.width / 2 });
    }
  }, [value]);

  return (
    <fieldset className={styles.fieldset}>
      <legend className={hideLegend ? 'visually-hidden' : styles.legend}>{legend}</legend>
      <div className={styles.list} ref={listRef}>
        {dates.map((date) => {
          const chip = formatDateChip(date, now);
          const selected = date === value;
          return (
            <label key={date} className={styles.item} data-selected={selected}>
              <input
                type="radio"
                className="visually-hidden"
                name={name}
                value={date}
                checked={selected}
                onChange={() => onChange(date)}
                aria-label={`${chip.weekday === 'Hoje' || chip.weekday === 'Amanhã' ? `${chip.weekday}, ` : ''}${formatDateLong(date)}`}
              />
              <span className={styles.weekday} aria-hidden="true">
                {chip.weekday}
              </span>
              <span className={styles.day} aria-hidden="true">
                {chip.day}
              </span>
              <span className={styles.month} aria-hidden="true">
                {chip.month}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
