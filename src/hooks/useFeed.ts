import { useCallback, useEffect, useRef, useState } from 'react';
import { socialService, visitor, registerPlayers } from '../services/socialService';
import type { Post, PostImage } from '../types/social';
import { api, betaEnabled, type FeedResponse } from '../services/api';
import { useAccount } from '../components/LoginGate';

export interface NewPostInput {
  caption: string;
  image?: PostImage;
  courtId?: string;
}

/**
 * No beta, usa a API persistente. Sem configuração, mantém a demonstração em memória.
 */
export function useFeed() {
  const { requireAccount, userId, ready } = useAccount();
  const [posts, setPosts] = useState<Post[]>(() => betaEnabled ? [] : socialService.listPosts());
  const [liked, setLiked] = useState<Set<string>>(() => new Set());
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [seenStories, setSeenStories] = useState<Set<string>>(() => new Set());

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(betaEnabled);
  const pending = useRef(new Set<string>());
  const deletedIds = useRef(new Set<string>());
  const refresh = useCallback(async () => {
    const data = await api<FeedResponse>('/feed');
    registerPlayers(data.players);
    setPosts(data.posts.filter(post => !deletedIds.current.has(post.id))); setLiked(new Set(data.liked)); setSaved(new Set(data.saved));
  }, []);
  useEffect(() => {
    if (!betaEnabled || !ready) return;
    if (!userId) { setLoading(false); return; }
    let active = true;
    const load = async () => {
      try {
        const data = await api<FeedResponse>('/feed');
        if (!active) return;
        registerPlayers(data.players);
        setPosts(data.posts.filter(post => !deletedIds.current.has(post.id))); setLiked(new Set(data.liked)); setSaved(new Set(data.saved)); setError('');
      } catch (err) { if (active) setError((err as Error).message); }
      finally { if (active) setLoading(false); }
    };
    void load();
    const timer = window.setInterval(() => { if (!document.hidden && !pending.current.size) void load(); }, 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [userId, ready]);
  const remoteToggle = async (id: string, kind: 'like' | 'save', active: boolean) => {
    const key = `${kind}:${id}`;
    if (pending.current.has(key)) return;
    pending.current.add(key); setError('');
    try { await api(`/posts/${id}/${kind}`, { method: 'PUT', body: JSON.stringify({ active }) }); await refresh(); }
    catch (err) { setError((err as Error).message); }
    finally { pending.current.delete(key); }
  };

  const toggleIn = (setter: typeof setLiked) => (id: string) => {
    if (!requireAccount()) return;
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLike = (id: string) => { if (!requireAccount()) return; if (betaEnabled) void remoteToggle(id, 'like', !liked.has(id)); else toggleIn(setLiked)(id); };
  const toggleSave = (id: string) => { if (!requireAccount()) return; if (betaEnabled) void remoteToggle(id, 'save', !saved.has(id)); else toggleIn(setSaved)(id); };

  const likeOnce = (id: string) => {
    if (!requireAccount()) return;
    if (betaEnabled) { void remoteToggle(id, 'like', true); return; }
    setLiked((current) => (current.has(id) ? current : new Set(current).add(id)));
  };

  const addComment = async (postId: string, text: string) => {
    if (!requireAccount()) throw new Error('Entre para enviar seu comentário.');
    if (betaEnabled) {
      await api(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
      await refresh(); return;
    }
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, { id: `local-${Date.now()}`, playerId: visitor.id, text }] }
          : post,
      ),
    );
  };

  const addPost = async (input: NewPostInput) => {
    if (!requireAccount()) throw new Error('Entre para publicar.');
    if (betaEnabled) {
      let uploadId: string | undefined;
      if (input.image) {
        if (!input.image.src.startsWith('blob:')) throw new Error('Escolha uma foto do seu aparelho.');
        const response = await fetch(input.image.src);
        const form = new FormData(); form.append('photo', await response.blob(), 'photo');
        ({ uploadId } = await api<{ uploadId: string }>('/uploads', { method: 'POST', body: form }));
      }
      const { id } = await api<{ id: string }>('/posts', { method: 'POST', body: JSON.stringify({ caption: input.caption, courtId: input.courtId, uploadId }) });
      await refresh(); return id;
    }
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
  };

  const markStorySeen = useCallback((storyId: string) => {
    setSeenStories((current) => (current.has(storyId) ? current : new Set(current).add(storyId)));
  }, []);

  const deletePost = async (postId: string) => {
    if (!requireAccount()) throw new Error('Entre para apagar sua publicação.');
    const post = posts.find(item => item.id === postId);
    if (!post || post.playerId !== (betaEnabled ? userId : visitor.id)) {
      throw new Error('Você só pode apagar suas próprias publicações.');
    }
    const key = `delete:${postId}`;
    if (pending.current.has(key)) return;
    pending.current.add(key);
    try {
      if (betaEnabled) await api(`/posts/${postId}`, { method: 'DELETE' });
      deletedIds.current.add(postId);
      setPosts(current => current.filter(item => item.id !== postId));
      for (const setter of [setLiked, setSaved]) setter(current => {
        const next = new Set(current); next.delete(postId); return next;
      });
    } finally { pending.current.delete(key); }
  };

  return { error, loading, posts, liked, saved, seenStories, toggleLike, likeOnce, toggleSave, addComment, addPost, deletePost, markStorySeen };
}

export type FeedState = ReturnType<typeof useFeed>;
