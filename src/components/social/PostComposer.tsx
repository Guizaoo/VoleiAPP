import { useEffect, useId, useState, type ChangeEvent } from 'react';
import { AlertCircle, ImagePlus, Info } from 'lucide-react';
import { photos } from '../../data/photos';
import type { NewPostInput } from '../../hooks/useFeed';
import { courtsService } from '../../services/courtsService';
import type { PostImage } from '../../types/social';
import { Dialog } from '../Dialog';
import styles from './PostComposer.module.css';

const samplePhotos: PostImage[] = [photos.sandSunset, photos.sandComplex, photos.indoorOrange, photos.sandBeach];
const MAX_CAPTION = 300;

interface PostComposerProps {
  onClose: () => void;
  onPublish: (input: NewPostInput) => void;
}

/** Criação de postagem simulada: a foto escolhida não sai do navegador. */
export function PostComposer({ onClose, onPublish }: PostComposerProps) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<PostImage | undefined>();
  const [courtId, setCourtId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const ids = useId();

  // Libera a URL temporária da foto enviada quando ela não é mais usada.
  useEffect(() => () => {
    if (uploadedUrl && image?.src !== uploadedUrl) URL.revokeObjectURL(uploadedUrl);
  }, [uploadedUrl, image]);

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Escolha um arquivo de imagem (JPG, PNG ou WebP).');
      return;
    }
    const url = URL.createObjectURL(file);
    setUploadedUrl(url);
    setImage({ src: url, alt: caption.trim() || 'Foto enviada pelo visitante', width: 1080, height: 1080 });
    setError(null);
  };

  const publish = () => {
    if (!image && !caption.trim()) {
      setError('Adicione uma foto ou escreva uma legenda para publicar.');
      return;
    }
    onPublish({
      caption: caption.trim(),
      image: image ? { ...image, alt: image.alt || caption.trim() } : undefined,
      courtId: courtId || undefined,
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      titleId={`${ids}-title`}
      closeLabel="Fechar nova postagem"
      footer={
        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={publish}>
          Publicar (demonstração)
        </button>
      }
    >
      <div className={styles.body}>
        <h2 id={`${ids}-title`} className={styles.title}>
          Nova postagem
        </h2>

        <div className={styles.preview}>
          {image ? (
            <img src={image.src} alt="Prévia da foto escolhida" width={image.width} height={image.height} />
          ) : (
            <span className={styles.placeholder}>
              <ImagePlus size={32} aria-hidden="true" />
              Escolha uma foto do seu jogo
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor={`${ids}-file`} className={`btn btn-secondary ${styles.fileButton}`}>
            <ImagePlus size={18} aria-hidden="true" />
            {uploadedUrl && image?.src === uploadedUrl ? 'Trocar foto' : 'Escolher foto do aparelho'}
          </label>
          <input id={`${ids}-file`} type="file" accept="image/*" className="visually-hidden" onChange={onFile} />
        </div>

        <fieldset className={styles.samples}>
          <legend>Ou use uma foto de exemplo</legend>
          <div className={styles.sampleGrid}>
            {samplePhotos.map((photo) => (
              <label key={photo.src} className={styles.sample} data-selected={image?.src === photo.src}>
                <input
                  type="radio"
                  name={`${ids}-sample`}
                  className="visually-hidden"
                  checked={image?.src === photo.src}
                  onChange={() => {
                    setImage(photo);
                    setError(null);
                  }}
                  aria-label={photo.alt}
                />
                <img src={photo.src} alt="" width={photo.width} height={photo.height} loading="lazy" />
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.field}>
          <label htmlFor={`${ids}-caption`} className={styles.label}>
            Legenda
          </label>
          <textarea
            id={`${ids}-caption`}
            rows={3}
            maxLength={MAX_CAPTION}
            placeholder="Como foi o jogo?"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              if (error) setError(null);
            }}
            aria-describedby={`${ids}-count`}
          />
          <span id={`${ids}-count`} className={styles.count}>
            {caption.length}/{MAX_CAPTION}
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor={`${ids}-court`} className={styles.label}>
            Marcar quadra (opcional)
          </label>
          <select id={`${ids}-court`} value={courtId} onChange={(e) => setCourtId(e.target.value)}>
            <option value="">Nenhuma</option>
            {courtsService.listCourts().map((court) => (
              <option key={court.id} value={court.id}>
                {court.name} · {court.neighborhood}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            {error}
          </p>
        )}

        <p className={styles.note}>
          <Info size={16} aria-hidden="true" />
          Demonstração: a postagem aparece só para você, neste navegador, e some ao recarregar a página. Nada é enviado.
        </p>
      </div>
    </Dialog>
  );
}
