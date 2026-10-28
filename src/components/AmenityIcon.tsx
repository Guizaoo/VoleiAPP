import {
  Accessibility,
  Armchair,
  Car,
  Coffee,
  Droplets,
  Lightbulb,
  Lock,
  ShowerHead,
  Toilet,
  Umbrella,
  Volleyball,
  type LucideIcon,
} from 'lucide-react';
import type { AmenityId } from '../types/court';

const icons: Record<AmenityId, LucideIcon> = {
  parking: Car,
  lighting: Lightbulb,
  restroom: Toilet,
  showers: ShowerHead,
  lockers: Lock,
  covered: Umbrella,
  water: Droplets,
  snackBar: Coffee,
  bleachers: Armchair,
  equipment: Volleyball,
  accessibility: Accessibility,
};

export function AmenityIcon({ amenity, size = 18 }: { amenity: AmenityId; size?: number }) {
  const Icon = icons[amenity];
  return <Icon size={size} aria-hidden="true" />;
}
