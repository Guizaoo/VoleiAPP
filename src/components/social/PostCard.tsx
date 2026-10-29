import { useRef, useState, type FormEvent } from 'react';
import { Bookmark, EllipsisVertical, MapPin, MessageSquare, Share2, Trash2, Volleyball } from 'lucide-react';
import { formatCount, formatTimeAgo } from '../../lib/format';
import { courtsService } from '../../services/courtsService';
import { socialService } from '../../services/socialService';
import type { Post } from '../../types/social';
import { CourtImage } from '../CourtImage';
import { Avatar } from './Avatar';
import { Dialog } from '../Dialog';
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
  onDelete?: () => Promise<void>;
}

const VISIBLE_COMMENTS = 2;

export function PostCard({ post, liked, saved, onToggleLike, onLike, onToggleSave, onComment, onOpenCourt, onDelete }: PostCardProps) {
  const author = socialService.getPlayer(post.playerId);
  const court = post.courtId ? courtsService.getCourt(post.courtId) : undefined;
  const [showAll, setShowAll] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const [burst, setBurst] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const optionsRef = useRef<HTMLDetailsElement>(null);
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

  const deletePublication = async () => {
    if (!onDelete || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try { await onDelete(); }
    catch (err) { setDeleteError((err as Error).message || 'Não foi possível apagar. Tente novamente.'); }
    finally { setDeleting(false); }
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
        {onDelete && <details className={styles.options} ref={optionsRef} onKeyDown={event => {
          if (event.key === 'Escape' && optionsRef.current) {
            optionsRef.current.open = false;
            optionsRef.current.querySelector('summary')?.focus();
          }
        }} onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false;
        }}>
          <summary aria-label="Opções da sua publicação"><EllipsisVertical size={21} aria-hidden="true" /></summary>
          <div className={styles.optionsPanel}>
            <button type="button" onClick={() => {
              if (optionsRef.current) optionsRef.current.open = false;
              setDeleteError(''); setConfirmDelete(true);
            }}><Trash2 size={17} aria-hidden="true" />Apagar publicação</button>
          </div>
        </details>}
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
      {onDelete && <Dialog open={confirmDelete} onClose={() => {
        if (deleting) return;
        setConfirmDelete(false);
        optionsRef.current?.querySelector('summary')?.focus();
      }} titleId={`${post.id}-delete-title`} closeLabel="Fechar confirmação" variant="centered" footer={
        <div className={styles.deleteActions}>
          <button type="button" className="btn btn-secondary" disabled={deleting} onClick={() => {
            setConfirmDelete(false);
            optionsRef.current?.querySelector('summary')?.focus();
          }}>Cancelar</button>
          <button type="button" className={`btn ${styles.deleteButton}`} disabled={deleting} onClick={deletePublication}>
            {deleting ? 'Apagando…' : 'Apagar publicação'}
          </button>
        </div>
      }>
        <section className={styles.deleteBody} aria-busy={deleting}>
          <h2 id={`${post.id}-delete-title`}>Apagar publicação?</h2>
          <p>Ela será removida do feed junto com as curtidas e os comentários. Essa ação não pode ser desfeita.</p>
          {deleteError && <p role="alert" className={styles.deleteError}>{deleteError}</p>}
        </section>
      </Dialog>}
    </article>
  );
}
