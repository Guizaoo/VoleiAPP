import { siteConfig } from '../config/site';
import { photoCredits } from '../data/photoCredits';
import { routePaths, type Route } from '../hooks/useRoute';
import { handleRouteClick, tabs } from './Header';
import { Logo } from './Logo';
import styles from './Footer.module.css';

const sectionLinks = [
  { hash: '#como-funciona', label: 'Como funciona' },
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
            <li><a href="/privacidade.html">Política de Privacidade</a></li>
            <li><a href="/termos.html">Termos de Serviço</a></li>
            {sectionLinks.map(({ hash, label }) => (
              <li key={hash}>
                <a href={`/${hash}`} onClick={(e) => handleRouteClick(e, () => onNavigate('quadras', hash))}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <section className={styles.about} aria-labelledby="about-levanta">
          <div>
            <h2 id="about-levanta">O vôlei aproxima. O Levanta conecta.</h2>
            <p>Somos uma comunidade feita para quem vive o vôlei. Reunimos quadras, histórias de jogos e pessoas
              em um só lugar, para facilitar seu próximo encontro com o esporte em {siteConfig.city}.</p>
          </div>
          <div className={styles.socials}>
            <h3>Vamos conversar</h3>
            <a className={styles.socialLink} href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              @levanta
              <span className="visually-hidden"> no Instagram (abre em nova aba)</span>
            </a>
            <a className={styles.socialLink} href="https://www.whatsapp.com/" target="_blank" rel="noreferrer">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.47 0 .11 5.35.1 11.93c0 2.1.55 4.16 1.6 5.97L0 24l6.25-1.64a11.94 11.94 0 0 0 5.8 1.48h.01c6.58 0 11.94-5.35 11.94-11.93a11.87 11.87 0 0 0-3.48-8.43ZM12.06 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.87 9.87 0 0 1-1.52-5.26c0-5.47 4.46-9.92 9.93-9.92a9.85 9.85 0 0 1 7.02 2.91 9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.97 9.86Z" />
                <path d="M17.5 14.4c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.77-.73 2.02-1.43.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35Z" />
              </svg>
              Fale com a gente
              <span className="visually-hidden"> no WhatsApp (abre em nova aba)</span>
            </a>
          </div>
        </section>
        <p className={styles.copyright}>© 2026 {siteConfig.name}. Feito para conectar quem quer jogar.</p>
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
