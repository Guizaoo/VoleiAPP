import { useId } from 'react';
import styles from './ChipGroup.module.css';

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  legend: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  hideLegend?: boolean;
  variant?: 'chips' | 'segmented';
}

/** Grupo de opções exclusivas com radios nativos e visual de chips. */
export function ChipGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  hideLegend = false,
  variant = 'chips',
}: ChipGroupProps<T>) {
  const name = useId();
  return (
    <fieldset className={`${styles.fieldset} ${variant === 'segmented' ? styles.segmented : ''}`}>
      <legend className={hideLegend ? 'visually-hidden' : styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.chip} data-selected={option.value === value}>
            <input
              type="radio"
              className="visually-hidden"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
