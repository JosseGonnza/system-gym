import type { SerieReg } from './types';

export const REPS_MAX_1RM = 12;

// Epley. Por encima de 12 reps se dispara y deja de servir.
export function e1rm(peso: number, reps: number): number | null {
  if (peso <= 0 || reps < 1 || reps > REPS_MAX_1RM) return null;
  return reps === 1 ? peso : peso * (1 + reps / 30);
}

export interface MejorSerie {
  peso: number;
  reps: number;
  e1rm: number;
}

export function mejorSerie(series: SerieReg[]): MejorSerie | null {
  let mejor: MejorSerie | null = null;
  for (const s of series) {
    if (s.estado === 'pendiente' || s.peso == null || s.reps == null) continue;
    const v = e1rm(s.peso, s.reps);
    if (v != null && (mejor == null || v > mejor.e1rm)) mejor = { peso: s.peso, reps: s.reps, e1rm: v };
  }
  return mejor;
}
