import { useEffect, useRef, useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { Logo } from './Logo';
import styles from './Header.module.css';

export const navLinks = [
  { href: '#quadras', label: 'Quadras' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#para-donos', label: 'Para donos de quadras' },
];

interface HeaderProps {
  onFindCourt: () => void;
}

export function Header({ onFindCourt }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={`container ${styles.inner}`}>
        <a href="#inicio" className={styles.brand} aria-label="Levanta, voltar ao início">
          <Logo />
        </a>

        <nav className={styles.desktopNav} aria-label="Principal">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <button type="button" className={`btn btn-primary ${styles.cta}`} onClick={onFindCourt}>
            <Search size={18} aria-hidden="true" />
            <span>Encontrar quadra</span>
          </button>
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuToggle}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <nav id="menu-mobile" className={styles.mobileNav} hidden={!menuOpen} aria-label="Menu">
        <ul className="container">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
