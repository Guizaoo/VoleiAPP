import { useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/scroll';
import type { CourtPhoto } from '../types/court';
import { CourtImage } from './CourtImage';
import styles from './Gallery.module.css';

interface GalleryProps {
  photos: CourtPhoto[];
  label: string;
}

/** Galeria deslizável (swipe no celular) com indicadores clicáveis. */
export function Gallery({ photos, label }: GalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    setIndex(i);
  };

  return (
    <div className={styles.gallery} role="group" aria-roledescription="galeria" aria-label={label}>
      <div
        ref={trackRef}
        className={styles.track}
        onScroll={(e) => {
          const el = e.currentTarget;
          const next = Math.round(el.scrollLeft / el.clientWidth);
          if (next !== index) setIndex(next);
        }}
      >
        {photos.map((photo, i) => (
          <div
            key={photo.src}
            className={styles.slide}
            aria-label={`Foto ${i + 1} de ${photos.length}`}
            role="group"
          >
            <CourtImage photo={photo} priority={i === 0} />
          </div>
        ))}
      </div>
      <span className={styles.photoNote}>Fotos ilustrativas</span>
      {photos.length > 1 && (
        <div className={styles.dots}>
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              className={styles.dot}
              aria-label={`Ver foto ${i + 1} de ${photos.length}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => goTo(i)}
            >
              <span />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
