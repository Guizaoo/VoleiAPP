import { siteConfig } from '../config/site';
import { photoCredits } from '../data/photoCredits';
import { navLinks } from './Header';
import { Logo } from './Logo';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo inverted />
          <p>{siteConfig.tagline}.</p>
        </div>
        <nav aria-label="Rodapé">
          <ul className={styles.nav}>
            <li>
              <a href="#inicio">Início</a>
            </li>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
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
