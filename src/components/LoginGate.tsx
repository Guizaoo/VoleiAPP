import { useState, type FormEvent, type ReactNode } from 'react';
import { normalizeName, normalizePhone, validateProfile, type LocalProfile } from '../lib/login';
import { setVisitorProfile } from '../services/socialService';
import { Logo } from './Logo';
import styles from './LoginGate.module.css';

const SESSION_KEY = 'levanta.local-profile.v1';

function readProfile(): LocalProfile | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null');
    if (!value || typeof value !== 'object') return null;
    const profile = value as LocalProfile;
    if (typeof profile.firstName !== 'string' || typeof profile.lastName !== 'string' || typeof profile.phone !== 'string') return null;
    return validateProfile(profile) ? null : profile;
  } catch {
    return null;
  }
}

export function LoginGate({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<LocalProfile | null>(readProfile);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = { firstName: normalizeName(firstName), lastName: normalizeName(lastName), phone: normalizePhone(phone) };
    const message = validateProfile(next);
    if (message) { setError(message); return; }
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {
      setError('Permita o armazenamento nesta aba para entrar.');
      return;
    }
    setProfile(next);
    setError('');
    setFirstName('');
    setLastName('');
    setPhone('');
  };

  if (profile) {
    setVisitorProfile(`${profile.firstName} ${profile.lastName}`);
    return <>
      <div className={styles.account}>
        <span>Olá, <strong>{profile.firstName}</strong>!</span>
        <button type="button" className="btn btn-ghost" onClick={() => {
          try { sessionStorage.removeItem(SESSION_KEY); } catch { /* A sessão em memória também é encerrada. */ }
          setVisitorProfile('Você');
          setProfile(null);
        }}>Sair</button>
      </div>
      {children}
    </>;
  }

  return <main className={styles.page}>
    <section className={styles.card} aria-labelledby="login-title">
      <Logo />
      <span className={styles.eyebrow}>Seu próximo jogo começa aqui</span>
      <h1 id="login-title">Entre para a comunidade</h1>
      <p>Conte como você se chama e informe seu celular para começar.</p>
      <form onSubmit={submit} className={styles.form}>
        <label htmlFor="first-name">Nome</label>
        <input id="first-name" autoComplete="given-name" value={firstName} onChange={e => setFirstName(e.target.value)} required maxLength={60} />
        <label htmlFor="last-name">Sobrenome</label>
        <input id="last-name" autoComplete="family-name" value={lastName} onChange={e => setLastName(e.target.value)} required maxLength={60} />
        <label htmlFor="phone">Celular com DDD</label>
        <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(98) 9XXXX-XXXX" value={phone} onChange={e => setPhone(e.target.value)} required maxLength={22} aria-describedby="phone-help login-error" />
        <small id="phone-help">Aceitamos celulares com DDD 98. Seu número não aparece no feed.</small>
        {error && <p id="login-error" role="alert" className={styles.error}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg btn-block">Entrar no Levanta</button>
      </form>
      <p className={styles.notice}>Acesso de demonstração nesta aba. Validamos o formato do celular; a confirmação por SMS ainda não está disponível. Este acesso não cria uma conta verificada.</p>
    </section>
  </main>;
}
