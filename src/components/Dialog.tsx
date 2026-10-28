import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Dialog.module.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** id do título visível, usado em aria-labelledby. */
  titleId: string;
  size?: 'md' | 'lg';
  /** Barra fixa no rodapé do painel (ex.: ação de reservar). */
  footer?: ReactNode;
  closeLabel?: string;
  children: ReactNode;
}

/**
 * Diálogo acessível: no celular abre como painel inferior (bottom sheet);
 * a partir de tablet, como modal centralizado.
 * - Foco preso dentro do painel e devolvido ao elemento de origem.
 * - Fecha com Escape ou clique fora.
 * - Bloqueia a rolagem e a interação com o fundo.
 */
export function Dialog({ open, onClose, titleId, size = 'md', footer, closeLabel = 'Fechar', children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const root = document.getElementById('root');
    const html = document.documentElement;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.style.overflow = 'hidden';
    if (scrollbarWidth > 0) html.style.paddingRight = `${scrollbarWidth}px`;
    root?.setAttribute('inert', '');
    root?.setAttribute('aria-hidden', 'true');

    const panel = panelRef.current;
    panel?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      html.style.overflow = '';
      html.style.paddingRight = '';
      root?.removeAttribute('inert');
      root?.removeAttribute('aria-hidden');
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`${styles.panel} ${size === 'lg' ? styles.large : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <span className={styles.handle} aria-hidden="true" />
        <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
          <X size={22} aria-hidden="true" />
        </button>
        <div className={styles.body} data-dialog-body>
          {children}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
