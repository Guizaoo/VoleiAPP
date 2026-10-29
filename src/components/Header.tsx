import type { MouseEvent } from 'react';
import { LayoutGrid, Newspaper, Trophy, UserRound } from 'lucide-react';
import { useAccount } from './LoginGate';
import { routePaths, type Route } from '../hooks/useRoute';
import { Logo } from './Logo';
import styles from './Header.module.css';

export const tabs: { route: Route; label: string; icon: typeof LayoutGrid }[] = [
  { route: 'quadras', label: 'Quadras', icon: LayoutGrid },
  { route: 'feed', label: 'Feed', icon: Newspaper },
  { route: 'ranking', label: 'Ranking', icon: Trophy },
];

interface HeaderProps {
  route: Route;
  onNavigate: (route: Route) => void;
}

/** Abre a rota no app sem recarregar; Ctrl/Cmd+clique continua abrindo em nova aba. */
export function handleRouteClick(event: MouseEvent<HTMLAnchorElement>, go: () => void) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  go();
}

export function Header({ route, onNavigate }: HeaderProps) {
  const { profile, openLogin, logout } = useAccount();
  const nav = (
    <ul className={styles.tabs}>
      {tabs.map(({ route: tab, label, icon: Icon }) => (
        <li key={tab}>
          <a
            href={routePaths[tab]}
            className={styles.tab}
            aria-current={route === tab ? 'page' : undefined}
            onClick={(e) => handleRouteClick(e, () => onNavigate(tab))}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a
          href="/"
          className={styles.brand}
          aria-label="Levanta, ir para Quadras"
          onClick={(e) => handleRouteClick(e, () => onNavigate('quadras'))}
        >
          <Logo />
        </a>

        <nav className={styles.desktopNav} aria-label="Principal">
          {nav}
        </nav>

        <div className={styles.actions}>
        {profile ? <div className={styles.account}>
          <span className={styles.accountName} title={profile.firstName}><UserRound size={18} aria-hidden="true" />{profile.firstName}</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>Sair</button>
        </div> : <button type="button" className={`btn btn-secondary ${styles.login}`} onClick={openLogin} aria-haspopup="dialog">
          <UserRound size={18} aria-hidden="true" /><span>Entrar / Registrar</span>
        </button>}
        </div>
      </div>

      <nav className={styles.mobileNav} aria-label="Principal">
        <div className="container">{nav}</div>
      </nav>
    </header>
  );
}
