import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { formatTimeAgo } from '../../lib/format';
import { socialService } from '../../services/socialService';
import type { Story } from '../../types/social';
import { CourtImage } from '../CourtImage';
import { Dialog } from '../Dialog';
import { Avatar } from './Avatar';
import styles from './StoryViewer.module.css';

const STORY_DURATION_MS = 5000;

interface StoryViewerProps {
  stories: Story[];
  startId: string;
  onSeen: (storyId: string) => void;
  onClose: () => void;
}

/** Visualizador de stories: avança sozinho a cada 5 s, com pausa e navegação manual. */
export function StoryViewer({ stories, startId, onSeen, onClose }: StoryViewerProps) {
  const [index, setIndex] = useState(() => Math.max(0, stories.findIndex((s) => s.id === startId)));
  const [paused, setPaused] = useState(false);
  const story = stories[index];
  const player = socialService.getPlayer(story.playerId);

  const next = () => (index < stories.length - 1 ? setIndex(index + 1) : onClose());
  const prev = () => setIndex(Math.max(0, index - 1));

  useEffect(() => onSeen(story.id), [story.id, onSeen]);

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(next, STORY_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [index, paused]); // `next` só muda junto com `index`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  return (
    <Dialog open onClose={onClose} titleId="story-title" variant="story" closeLabel="Fechar stories">
      <div className={styles.viewer}>
        <div className={styles.progress} aria-hidden="true">
          {stories.map((s, i) => (
            <span key={s.id} className={styles.track}>
              <span
                key={i === index ? `${s.id}-active` : s.id}
                className={`${styles.fill} ${i < index ? styles.done : ''} ${i === index ? styles.active : ''}`}
                style={{ animationDuration: `${STORY_DURATION_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
              />
            </span>
          ))}
        </div>

        <header className={styles.header}>
          <Avatar player={player} size={36} />
          <div>
            <h2 id="story-title" className={styles.name}>
              {player.name}
            </h2>
            <p className={styles.time}>{formatTimeAgo(story.minutesAgo)}</p>
          </div>
          <button
            type="button"
            className={styles.pause}
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Continuar stories' : 'Pausar stories'}
          >
            {paused ? <Play size={20} aria-hidden="true" /> : <Pause size={20} aria-hidden="true" />}
          </button>
        </header>

        <div className={styles.media}>
          <CourtImage key={story.id} photo={story.image} priority />
        </div>

        <p className={styles.caption} aria-live="polite">
          {story.caption}
          <span className="visually-hidden">
            {' '}
            · Story {index + 1} de {stories.length}
          </span>
        </p>

        <button type="button" className={`${styles.zone} ${styles.zonePrev}`} onClick={prev} disabled={index === 0}>
          <ChevronLeft size={28} aria-hidden="true" />
          <span className="visually-hidden">Story anterior</span>
        </button>
        <button type="button" className={`${styles.zone} ${styles.zoneNext}`} onClick={next}>
          <ChevronRight size={28} aria-hidden="true" />
          <span className="visually-hidden">{index < stories.length - 1 ? 'Próximo story' : 'Fechar stories'}</span>
        </button>
      </div>
    </Dialog>
  );
}
