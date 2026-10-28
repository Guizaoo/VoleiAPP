import { siteConfig } from '../config/site';
import { photoCredits } from '../data/photoCredits';
import { routePaths, type Route } from '../hooks/useRoute';
import { handleRouteClick, tabs } from './Header';
import { Logo } from './Logo';
import styles from './Footer.module.css';

const sectionLinks = [
  { hash: '#como-funciona', label: 'Como funciona' },
  { hash: '#para-donos', label: 'Para donos de quadras' },
];

interface FooterProps {
  onNavigate: (route: Route, hash?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo inverted />
          <p>{siteConfig.tagline}.</p>
        </div>
        <nav aria-label="Rodapé">
          <ul className={styles.nav}>
            {tabs.map(({ route, label }) => (
              <li key={route}>
                <a href={routePaths[route]} onClick={(e) => handleRouteClick(e, () => onNavigate(route))}>
                  {label}
                </a>
              </li>
            ))}
            {sectionLinks.map(({ hash, label }) => (
              <li key={hash}>
                <a href={`/${hash}`} onClick={(e) => handleRouteClick(e, () => onNavigate('quadras', hash))}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className={styles.notice}>
          Protótipo para validação de ideia, sem parceria com os locais exibidos. Nomes e endereços vêm de fontes
          públicas; fotos, preços e horários são ilustrativos e nenhuma reserva ou cobrança é realizada.
        </p>
        <details className={styles.credits}>
          <summary>Créditos das fotos</summary>
          <ul>
            {photoCredits.map((credit) => (
              <li key={credit.file}>
                <a href={credit.url} target="_blank" rel="noreferrer">
                  {credit.author}
                </a>{' '}
                · {credit.license} · Wikimedia Commons
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  );
}
