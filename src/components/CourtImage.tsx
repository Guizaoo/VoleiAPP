import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { CourtPhoto } from '../types/court';
import styles from './CourtImage.module.css';

interface CourtImageProps {
  photo: CourtPhoto;
  className?: string;
  priority?: boolean;
}

/** Foto com dimensões definidas, carregamento preguiçoso e fallback visual se falhar. */
export function CourtImage({ photo, className = '', priority = false }: CourtImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`${styles.fallback} ${className}`} role="img" aria-label={`${photo.alt} (foto indisponível)`}>
        <ImageOff size={28} aria-hidden="true" />
        <span>Foto indisponível</span>
      </div>
    );
  }

  return (
    <img
      className={`${styles.image} ${className}`}
      src={photo.src}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
