import { useMemo, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { FeedState } from '../../hooks/useFeed';
import { socialService, visitor } from '../../services/socialService';
import { Avatar } from './Avatar';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { RankingWidget } from './RankingWidget';
import { StoriesBar } from './StoriesBar';
import { StoryViewer } from './StoryViewer';
import styles from './FeedPage.module.css';
import { useAccount } from '../LoginGate';

function sortStories(seen: Set<string>) {
  const all = socialService.listStories();
  return [...all.filter((s) => !seen.has(s.id)), ...all.filter((s) => seen.has(s.id))];
}

interface FeedPageProps {
  feed: FeedState;
  onOpenCourt: (courtId: string) => void;
  onSeeRanking: () => void;
}

export function FeedPage({ feed, onOpenCourt, onSeeRanking }: FeedPageProps) {
  const { requireAccount } = useAccount();
  const openComposer = () => { if (requireAccount()) setComposerOpen(true); };
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [storyId, setStoryId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const ranking = useMemo(() => socialService.getRanking('all', 'week'), []);

  // Stories ainda não vistos aparecem primeiro. A ordem só muda ao fechar o visualizador.
  const [stories, setStories] = useState(() => sortStories(feed.seenStories));
  const closeStories = () => {
    setStoryId(null);
    setStories(sortStories(feed.seenStories));
  };

  return (
    <main id="conteudo" className={`container ${styles.page}`} tabIndex={-1} aria-labelledby="feed-title">
      <header className={styles.intro}>
        <h1 id="feed-title" className={styles.title}>
          Feed
        </h1>
      </header>

      <div className={styles.layout}>
        <div className={styles.stories}>
          <StoriesBar
            stories={stories}
            seen={feed.seenStories}
            onOpen={setStoryId}
            onCreate={openComposer}
          />
        </div>

        <aside className={styles.side}>
          <RankingWidget entries={ranking} onSeeAll={onSeeRanking} limit={isDesktop ? 5 : 3} />
        </aside>

        <div className={styles.posts}>
          <button type="button" className={styles.composerBar} onClick={openComposer}>
            <Avatar player={visitor} size={36} />
            <span>Compartilhe seu jogo…</span>
            <ImagePlus size={22} aria-hidden="true" />
          </button>

          {feed.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={feed.liked.has(post.id)}
              saved={feed.saved.has(post.id)}
              onToggleLike={() => feed.toggleLike(post.id)}
              onLike={() => feed.likeOnce(post.id)}
              onToggleSave={() => feed.toggleSave(post.id)}
              onComment={(text) => feed.addComment(post.id, text)}
              onOpenCourt={onOpenCourt}
            />
          ))}

          <p className={styles.end}>Você viu todas as postagens.</p>
        </div>
      </div>

      {storyId && (
        <StoryViewer stories={stories} startId={storyId} onSeen={feed.markStorySeen} onClose={closeStories} />
      )}

      {composerOpen && (
        <PostComposer
          onClose={() => setComposerOpen(false)}
          onPublish={(input) => {
            const id = feed.addPost(input);
            setComposerOpen(false);
            // Mostra a postagem recém-criada no topo da lista.
            window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
          }}
        />
      )}
    </main>
  );
}
