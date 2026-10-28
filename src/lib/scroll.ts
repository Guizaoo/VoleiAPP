export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Rola até uma seção respeitando a preferência por movimento reduzido. */
export function scrollToSection(id: string, focusSelector?: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  const target = focusSelector ? el.querySelector<HTMLElement>(focusSelector) : null;
  // preventScroll evita que o foco interrompa a rolagem suave.
  (target ?? el).focus({ preventScroll: true });
}
