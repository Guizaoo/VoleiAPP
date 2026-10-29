import type { Player, Post } from '../types/social';

// Sem a flag, o localhost continua como demonstração independente do servidor.
export const betaEnabled = import.meta.env.VITE_BETA_ENABLED === 'true';
export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options, credentials: 'same-origin', cache: 'no-store',
    headers: options.body instanceof FormData ? options.headers : { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => ({ error: 'Não foi possível conectar ao servidor.' }));
  if (!response.ok) {
    const requestId = response.headers.get('X-Request-ID');
    const message = body.error || 'Não foi possível concluir. Tente novamente.';
    throw new Error(requestId ? `${message} (Referência: ${requestId})` : message);
  }
  return body as T;
}
export interface FeedResponse { posts: Post[]; players: Player[]; liked: string[]; saved: string[] }
