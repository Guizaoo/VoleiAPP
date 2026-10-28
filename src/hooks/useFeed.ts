import { useCallback, useState } from 'react';
import { socialService, visitor } from '../services/socialService';
import type { Post, PostImage } from '../types/social';

export interface NewPostInput {
  caption: string;
  image?: PostImage;
  courtId?: string;
}

/**
 * Estado do feed durante a visita: curtidas, salvos, comentários e postagens
 * do visitante. Nada é enviado nem persistido — recarregar a página zera tudo.
 */
export function useFeed() {
  const [posts, setPosts] = useState<Post[]>(() => socialService.listPosts());
  const [liked, setLiked] = useState<Set<string>>(() => new Set());
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [seenStories, setSeenStories] = useState<Set<string>>(() => new Set());

  const toggleIn = (setter: typeof setLiked) => (id: string) =>
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleLike = useCallback(toggleIn(setLiked), []);
  const toggleSave = useCallback(toggleIn(setSaved), []);

  const likeOnce = useCallback((id: string) => {
    setLiked((current) => (current.has(id) ? current : new Set(current).add(id)));
  }, []);

  const addComment = useCallback((postId: string, text: string) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, { id: `local-${Date.now()}`, playerId: visitor.id, text }] }
          : post,
      ),
    );
  }, []);

  const addPost = useCallback((input: NewPostInput) => {
    const post: Post = {
      id: `local-${Date.now()}`,
      playerId: visitor.id,
      caption: input.caption,
      image: input.image,
      courtId: input.courtId,
      minutesAgo: 0,
      likes: 0,
      comments: [],
      isLocal: true,
    };
    setPosts((current) => [post, ...current]);
    return post.id;
  }, []);

  const markStorySeen = useCallback((storyId: string) => {
    setSeenStories((current) => (current.has(storyId) ? current : new Set(current).add(storyId)));
  }, []);

  return { posts, liked, saved, seenStories, toggleLike, likeOnce, toggleSave, addComment, addPost, markStorySeen };
}

export type FeedState = ReturnType<typeof useFeed>;
