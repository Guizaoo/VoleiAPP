import type { AmenityId, Coverage, Modality } from '../types/court';

export const modalityLabels: Record<Modality, string> = {
  indoor: 'Vôlei de quadra',
  beach: 'Vôlei de areia',
};

export const coverageLabels: Record<Coverage, string> = {
  covered: 'Coberta',
  uncovered: 'Descoberta',
};

export const amenityLabels: Record<AmenityId, string> = {
  parking: 'Estacionamento',
  lighting: 'Iluminação noturna',
  restroom: 'Banheiro',
  showers: 'Chuveiros',
  lockers: 'Vestiário',
  covered: 'Cobertura',
  water: 'Bebedouro',
  snackBar: 'Lanchonete',
  bleachers: 'Arquibancada',
  equipment: 'Empréstimo de bolas',
  accessibility: 'Acessibilidade',
};
