import type { Player } from '../../types/social';
import styles from './Avatar.module.css';

function initials(name: string) {
  const parts = name.replace(/\./g, '').split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

interface AvatarProps {
  player: Player;
  size?: number;
  /** Anel dos stories; "seen" deixa o anel cinza. */
  ring?: 'new' | 'seen';
}

/** Avatar com iniciais (os perfis fictícios não usam fotos de pessoas). */
export function Avatar({ player, size = 40, ring }: AvatarProps) {
  const outer = size + (ring ? 8 : 0);
  return (
    <span className={`${styles.wrap} ${ring ? styles[ring] : ''}`} style={{ width: outer, height: outer }} aria-hidden="true">
      <span
        className={styles.avatar}
        style={{ width: size, height: size, background: player.avatarColor, fontSize: Math.round(size * 0.38) }}
      >
        {initials(player.name)}
      </span>
    </span>
  );
}
