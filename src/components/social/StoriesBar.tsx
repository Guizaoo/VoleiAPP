import { Plus } from 'lucide-react';
import { formatTimeAgo } from '../../lib/format';
import { socialService, visitor } from '../../services/socialService';
import type { Story } from '../../types/social';
import { Avatar } from './Avatar';
import styles from './StoriesBar.module.css';

interface StoriesBarProps {
  stories: Story[];
  seen: Set<string>;
  onOpen: (storyId: string) => void;
  onCreate: () => void;
}

export function StoriesBar({ stories, seen, onOpen, onCreate }: StoriesBarProps) {
  return (
    <section className={styles.bar} aria-label="Stories">
      <ul className={styles.list}>
        <li>
          <button type="button" className={styles.item} onClick={onCreate} aria-label="Criar postagem">
            <span className={styles.create}>
              <Avatar player={visitor} size={58} />
              <span className={styles.plus}>
                <Plus size={14} strokeWidth={3} aria-hidden="true" />
              </span>
            </span>
            <span className={styles.name}>Postar</span>
          </button>
        </li>
        {stories.map((story) => {
          const player = socialService.getPlayer(story.playerId);
          const isSeen = seen.has(story.id);
          return (
            <li key={story.id}>
              <button
                type="button"
                className={styles.item}
                onClick={() => onOpen(story.id)}
                aria-label={`Ver story de ${player.name}, ${formatTimeAgo(story.minutesAgo)}${isSeen ? ', já visto' : ''}`}
              >
                <Avatar player={player} size={58} ring={isSeen ? 'seen' : 'new'} />
                <span className={styles.name} aria-hidden="true">
                  {player.name.split(' ')[0]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
