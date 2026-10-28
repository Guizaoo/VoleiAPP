import type { CourtPhoto } from '../types/court';

/** Fotos genéricas em /public/images (origem e licenças no README). */
export const photos = {
  indoorOrange: { src: '/images/indoor-laranja-1.jpg', alt: 'Quadra de vôlei coberta com piso laranja e rede montada', width: 1100, height: 825 },
  indoorStands: { src: '/images/indoor-laranja-2.jpg', alt: 'Ginásio com quadra de vôlei laranja e redes de proteção', width: 1100, height: 825 },
  gym: { src: '/images/ginasio-1.jpg', alt: 'Interior de um ginásio amplo e iluminado', width: 1100, height: 687 },
  sand: { src: '/images/areia-1.jpg', alt: 'Quadra de vôlei de areia ao ar livre com rede e marcação amarela', width: 1100, height: 825 },
  sandComplex: { src: '/images/areia-complexo-1.jpg', alt: 'Quadras de areia lado a lado em área gramada', width: 1100, height: 679 },
  sandBeach: { src: '/images/areia-praia-1.jpg', alt: 'Faixa de areia com postes de iluminação e redes de vôlei', width: 1100, height: 825 },
  sandArena: { src: '/images/areia-arena-1.jpg', alt: 'Arena de areia com postes de iluminação e palmeira', width: 1100, height: 825 },
  sandSunset: { src: '/images/areia-entardecer-1.jpg', alt: 'Rede de vôlei de praia ao pôr do sol', width: 1100, height: 731 },
  netSunset: { src: '/images/hero-rede-entardecer.jpg', alt: 'Rede de vôlei de praia ao entardecer', width: 1100, height: 825 },
  multiCourt: { src: '/images/poliesportiva-1.jpg', alt: 'Quadra poliesportiva ao ar livre entre prédios', width: 1100, height: 733 },
} satisfies Record<string, CourtPhoto>;
