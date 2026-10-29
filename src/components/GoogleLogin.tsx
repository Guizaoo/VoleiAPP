import { useEffect, useRef, useState } from 'react';
import { api, googleClientId } from '../services/api';
import type { Player } from '../types/social';

type GoogleIdentity = { accounts: { id: {
  initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
  renderButton: (element: HTMLElement, options: { theme: string; size: string; text: string; locale: string }) => void;
} } };
declare global { interface Window { google?: GoogleIdentity } }
let scriptPromise: Promise<void> | undefined;
function loadGoogle() {
  if (window.google) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); scriptPromise = undefined; reject(new Error('Não foi possível carregar o Google. Confira sua conexão e reabra esta janela.')); };
    document.head.append(script);
  });
  return scriptPromise;
}
export function GoogleLogin({ onSuccess }: { onSuccess: (user: Player) => void }) {
  const button = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!googleClientId) return;
    let active = true;
    loadGoogle().then(() => {
      if (!active || !button.current || !window.google) return;
      window.google.accounts.id.initialize({ client_id: googleClientId, callback: async ({ credential }) => {
        if (!active) return;
        setBusy(true); setError('');
        try { const { user } = await api<{ user: Player }>('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }); if (active) onSuccess(user); }
        catch (err) { if (active) setError((err as Error).message); }
        finally { if (active) setBusy(false); }
      } });
      window.google.accounts.id.renderButton(button.current, { theme: 'outline', size: 'large', text: 'continue_with', locale: 'pt-BR' });
    }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [onSuccess]);
  return <div style={{ marginTop: 28 }}>
    {googleClientId ? <div ref={button} aria-label="Continuar com Google" style={{ pointerEvents: busy ? 'none' : undefined }} /> : <p role="status">O login Google ainda precisa ser configurado para este ambiente.</p>}
    {busy && <p role="status">Entrando…</p>}
    {error && <p role="alert">{error}</p>}
    <p style={{ fontSize: 12, marginTop: 16 }}>Beta fechado: use o e-mail que recebeu o convite.</p>
  </div>;
}
