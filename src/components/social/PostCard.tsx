import { useRef, useState, type FormEvent } from 'react';
import { Bookmark, MapPin, MessageSquare, Share2, Volleyball } from 'lucide-react';
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
  onComment: (text: string) => Promise<void>;
  onOpenCourt: (courtId: string) => void;
}

const VISIBLE_COMMENTS = 2;

export function PostCard({ post, liked, saved, onToggleLike, onLike, onToggleSave, onComment, onOpenCourt }: PostCardProps) {
  const author = socialService.getPlayer(post.playerId);
  const court = post.courtId ? courtsService.getCourt(post.courtId) : undefined;
  const [showAll, setShowAll] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const [burst, setBurst] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const likes = post.likes + (liked ? 1 : 0);
  const hidden = Math.max(0, post.comments.length - VISIBLE_COMMENTS);
  const comments = showAll ? post.comments : post.comments.slice(-VISIBLE_COMMENTS);
  const titleId = `${post.id}-author`;

  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try { await onComment(text); setDraft(''); setShowAll(true); setStatus(''); }
    catch (err) { setStatus((err as Error).message); }
    finally { setSending(false); }
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

      {post.caption && <p className={styles.caption}>{post.caption}</p>}

      {post.image && (
        <div className={styles.media} onDoubleClick={likeFromImage}>
          <CourtImage photo={post.image} />
          {burst > 0 && (
            <span key={burst} className={styles.burst} aria-hidden="true">
              <Volleyball size={84} strokeWidth={1.8} />
            </span>
          )}
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.action} ${styles.cheer} ${liked ? styles.cheered : ''}`}
            onClick={onToggleLike}
            aria-pressed={liked}
          >
            <Volleyball size={19} aria-hidden="true" />
            <span>Boa!</span>
            {likes > 0 && (
              <span className={styles.count}>
                {formatCount(likes)}
                <span className="visually-hidden"> {likes === 1 ? 'pessoa mandou' : 'pessoas mandaram'}</span>
              </span>
            )}
          </button>
          <button type="button" className={styles.action} onClick={() => inputRef.current?.focus()}>
            <MessageSquare size={19} aria-hidden="true" />
            <span className={styles.count}>{post.comments.length}</span>
            <span className="visually-hidden">{post.comments.length === 1 ? 'comentário' : 'comentários'}, comentar</span>
          </button>
          <button type="button" className={styles.action} onClick={share}>
            <Share2 size={19} aria-hidden="true" />
            <span className={styles.optionalLabel}>Compartilhar</span>
          </button>
          <button
            type="button"
            className={`${styles.action} ${saved ? styles.saved : ''}`}
            onClick={onToggleSave}
            aria-pressed={saved}
          >
            <Bookmark size={19} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
            <span className={styles.optionalLabel}>{saved ? 'Salvo' : 'Salvar'}</span>
          </button>
        </div>

        <p className={styles.status} role="status">
          {status}
        </p>

        {hidden > 0 && !showAll && (
          <button type="button" className={styles.more} onClick={() => setShowAll(true)}>
            Ver os {post.comments.length} comentários
          </button>
        )}

        {comments.length > 0 && (
          <ul className={styles.comments} aria-label="Comentários">
            {comments.map((comment) => {
              const commenter = socialService.getPlayer(comment.playerId);
              return (
                <li key={comment.id}>
                  <Avatar player={commenter} size={28} />
                  <p className={styles.bubble}>
                    <strong>{commenter.name}</strong>
                    {comment.text}
                  </p>
                </li>
              );
            })}
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
            placeholder="Escreva um comentário…"
            autoComplete="off"
            maxLength={200}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" disabled={!draft.trim() || sending}>
            Enviar
          </button>
        </form>
      </div>
    </article>
  );
}
