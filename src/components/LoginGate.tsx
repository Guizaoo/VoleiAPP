import { createContext, useCallback, useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { normalizeName, normalizePhone, validateProfile, type LocalProfile } from '../lib/login';
import { setVisitorProfile } from '../services/socialService';
import { ArrowRight, UserRound, Phone, Volleyball } from 'lucide-react';
import { api, betaEnabled } from '../services/api';
import type { Player } from '../types/social';
import { GoogleLogin } from './GoogleLogin';
import { registerPlayers, visitor } from '../services/socialService';
import { Logo } from './Logo';
import { Dialog } from './Dialog';
import styles from './LoginGate.module.css';

const SESSION_KEY = 'levanta.local-profile.v1';

interface AccountState {
  profile: LocalProfile | null;
  userId: string | null;
  ready: boolean;
  openLogin: () => void;
  logout: () => void;
  requireAccount: () => boolean;
}
const AccountContext = createContext<AccountState | null>(null);
export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error('Account provider is missing');
  return account;
}

function readProfile(): LocalProfile | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null');
    if (!value || typeof value !== 'object') return null;
    const profile = value as LocalProfile;
    if (typeof profile.firstName !== 'string' || typeof profile.lastName !== 'string' || typeof profile.phone !== 'string') return null;
    if (validateProfile(profile)) return null;
    setVisitorProfile(`${profile.firstName} ${profile.lastName}`);
    return profile;
  } catch {
    return null;
  }
}

export function LoginGate({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LocalProfile | null>(() => betaEnabled ? null : readProfile());
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(!betaEnabled);
  const acceptUser = useCallback((user: Player) => {
    registerPlayers([user]);
    Object.assign(visitor, user);
    const [firstName, ...rest] = user.name.split(' ');
    setProfile({ firstName, lastName: rest.join(' '), phone: '' });
    setUserId(user.id);
    setOpen(false);
  }, []);
  useEffect(() => {
    if (!betaEnabled) return;
    let active = true;
    api<{ user: Player }>('/auth/me').then(({ user }) => { if (active) acceptUser(user); }).catch(() => {}).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [acceptUser]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const openLogin = useCallback(() => setOpen(true), []);
  const requireAccount = useCallback(() => {
    if (profile) return true;
    setOpen(true);
    return false;
  }, [profile]);
  const logout = async () => {
    if (betaEnabled) {
      try { await api('/auth/logout', { method: 'POST' }); }
      catch { setError('Não foi possível sair. Tente novamente.'); setOpen(true); return; }
      setUserId(null);
      visitor.id = 'voce';
    }
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Encerra também em memória. */ }
    setVisitorProfile('Você');
    setProfile(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const [firstName, ...surname] = normalizeName(fullName).split(' ');
    if (!surname.length) {
      setError('Informe seu nome e sobrenome no campo Nome completo.');
      return;
    }
    const next = { firstName, lastName: surname.join(' '), phone: normalizePhone(phone) };
    const message = validateProfile(next);
    if (message) { setError(message); return; }
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {
      setError('Permita o armazenamento nesta aba para entrar.');
      return;
    }
    setVisitorProfile(`${next.firstName} ${next.lastName}`);
    setProfile(next);
    setOpen(false);
    setError('');
    setFullName('');
    setPhone('');
  };

  return <AccountContext.Provider value={{ profile, userId, ready, openLogin, logout, requireAccount }}>
    <div key={userId ?? profile?.phone ?? 'guest'}>{children}</div>
    <Dialog open={open} onClose={() => { setOpen(false); setError(''); }} titleId="login-title" closeLabel="Fechar entrada">
    <section className={styles.content} aria-labelledby="login-title">
      <header className={styles.header}><Logo /></header>
      <div className={styles.intro}>
        <span className={styles.eyebrow}><Volleyball size={16} aria-hidden="true" /> Seu próximo jogo começa aqui</span>
        <h2 id="login-title">Entre para a comunidade</h2>
        <p>{betaEnabled ? 'Entre com sua conta Google para compartilhar seus jogos com a comunidade.' : 'Encontre sua turma e faça parte do jogo. Para começar, conte um pouco sobre você.'}</p>
      </div>
      {betaEnabled && error && <p role="alert" className={styles.error}>{error}</p>}
      {betaEnabled ? <GoogleLogin onSuccess={acceptUser} /> : <form onSubmit={submit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="full-name">Nome completo</label>
          <div className={styles.inputWrap}>
            <UserRound size={19} aria-hidden="true" />
            <input id="full-name" autoComplete="name" placeholder="Seu nome e sobrenome" value={fullName} onChange={e => { setFullName(e.target.value); setError(''); }} required maxLength={121} aria-describedby={error ? 'login-error' : undefined} />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="phone">Celular com DDD</label>
          <div className={styles.inputWrap}>
            <Phone size={19} aria-hidden="true" />
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(98) 9XXXX-XXXX" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} required maxLength={22} aria-describedby={error ? 'phone-hint login-error' : 'phone-hint'} />
          </div>
          <small id="phone-hint">Use um celular com DDD 98.</small>
        </div>
        {error && <p id="login-error" role="alert" className={styles.error}>{error}</p>}
        <button type="submit" className={`btn btn-primary btn-block ${styles.submit}`}>Entrar no Levanta <ArrowRight size={19} aria-hidden="true" /></button>
      </form>}
      <div className={styles.footer}><span aria-hidden="true" className={styles.statusDot} /> Mais gente na quadra. Mais jogo na sua vida.</div>
    </section>
    </Dialog>
  </AccountContext.Provider>;
}
