import { useRef, useState, type FormEvent } from 'react';
import { Bookmark, Heart, MapPin, MessageCircle, Send } from 'lucide-react';
import { formatCount, formatTimeAgo } from '../../lib/format';
import { courtsService } from '../../services/courtsService';
import { socialService } from '../../services/socialService';
import type { Post } from '../../types/social';
import { CourtImage } from '../CourtImage';
import { Avatar } from './Avatar';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: Post;
  liked: boolean;
  saved: boolean;
  onToggleLike: () => void;
  onLike: () => void;
  onToggleSave: () => void;
  onComment: (text: string) => void;
  onOpenCourt: (courtId: string) => void;
}

const VISIBLE_COMMENTS = 2;

export function PostCard({ post, liked, saved, onToggleLike, onLike, onToggleSave, onComment, onOpenCourt }: PostCardProps) {
  const author = socialService.getPlayer(post.playerId);
  const court = post.courtId ? courtsService.getCourt(post.courtId) : undefined;
  const [showAll, setShowAll] = useState(false);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const [burst, setBurst] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const likes = post.likes + (liked ? 1 : 0);
  const hidden = Math.max(0, post.comments.length - VISIBLE_COMMENTS);
  const comments = showAll ? post.comments : post.comments.slice(-VISIBLE_COMMENTS);
  const titleId = `${post.id}-author`;

  const submitComment = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onComment(text);
    setDraft('');
    setShowAll(true);
  };

  const share = async () => {
    const url = `${window.location.origin}/feed#${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Postagem de ${author.name}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus('Link copiado.');
    } catch (error) {
      // Cancelar o menu de compartilhamento não é erro.
      if ((error as Error).name === 'AbortError') return;
      setStatus('Não foi possível compartilhar agora.');
    }
    window.setTimeout(() => setStatus(''), 2500);
  };

  const likeFromImage = () => {
    onLike();
    setBurst((b) => b + 1);
  };

  return (
    <article id={post.id} className={styles.post} aria-labelledby={titleId}>
      <header className={styles.header}>
        <Avatar player={author} size={40} />
        <div className={styles.meta}>
          <p className={styles.author}>
            <strong id={titleId}>{author.name}</strong>
            <span className={styles.time}> · {formatTimeAgo(post.minutesAgo)}</span>
          </p>
          {court && (
            <button type="button" className={styles.location} onClick={() => onOpenCourt(court.id)}>
              <MapPin size={13} aria-hidden="true" />
              {court.name} · {court.neighborhood}
              <span className="visually-hidden"> — ver horários da quadra</span>
            </button>
          )}
        </div>
        {post.isLocal && <span className={styles.localTag}>Só você vê</span>}
      </header>

      {post.image && (
        <div className={styles.media} onDoubleClick={likeFromImage}>
          <CourtImage photo={post.image} />
          {burst > 0 && (
            <span key={burst} className={styles.burst} aria-hidden="true">
              <Heart size={88} fill="currentColor" strokeWidth={0} />
            </span>
          )}
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.action} ${liked ? styles.liked : ''}`}
            onClick={onToggleLike}
            aria-pressed={liked}
            aria-label="Curtir"
          >
            <Heart size={24} fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
          <button type="button" className={styles.action} onClick={() => inputRef.current?.focus()} aria-label="Comentar">
            <MessageCircle size={24} aria-hidden="true" />
          </button>
          <button type="button" className={styles.action} onClick={share} aria-label="Compartilhar">
            <Send size={23} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.action} ${styles.save} ${saved ? styles.saved : ''}`}
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label="Salvar"
          >
            <Bookmark size={24} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </div>

        <p className={styles.status} role="status">
          {status}
        </p>

        <p className={styles.likes}>
          {likes === 0 ? 'Seja o primeiro a curtir' : `${formatCount(likes)} ${likes === 1 ? 'curtida' : 'curtidas'}`}
        </p>

        {post.caption && (
          <p className={styles.caption}>
            <strong>{author.handle}</strong> {post.caption}
          </p>
        )}

        {hidden > 0 && !showAll && (
          <button type="button" className={styles.more} onClick={() => setShowAll(true)}>
            Ver todos os {post.comments.length} comentários
          </button>
        )}

        {comments.length > 0 && (
          <ul className={styles.comments} aria-label="Comentários">
            {comments.map((comment) => (
              <li key={comment.id}>
                <strong>{socialService.getPlayer(comment.playerId).handle}</strong> {comment.text}
              </li>
            ))}
          </ul>
        )}

        <form className={styles.commentForm} onSubmit={submitComment}>
          <label htmlFor={`${post.id}-comment`} className="visually-hidden">
            Adicionar comentário na postagem de {author.name}
          </label>
          <input
            ref={inputRef}
            id={`${post.id}-comment`}
            type="text"
            placeholder="Adicione um comentário…"
            autoComplete="off"
            maxLength={200}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" disabled={!draft.trim()}>
            Publicar
          </button>
        </form>
      </div>
    </article>
  );
}
