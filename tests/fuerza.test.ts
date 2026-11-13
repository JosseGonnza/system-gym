import { describe, expect, it } from 'vitest';
import { e1rm, mejorSerie } from '../src/lib/fuerza';
import type { SerieReg } from '../src/lib/types';

const s = (peso: number | null, reps: number | null, estado: SerieReg['estado'] = 'completada'): SerieReg => ({ peso, reps, estado });

describe('1RM estimado', () => {
  it('Epley: una repetición es el propio peso', () => {
    expect(e1rm(100, 1)).toBe(100);
    expect(e1rm(22, 6)).toBeCloseTo(26.4, 5);
    expect(e1rm(18, 10)).toBeCloseTo(24, 5);
  });

  it('no estima con más de 12 reps, sin reps o sin peso', () => {
    expect([e1rm(50, 13), e1rm(50, 0), e1rm(0, 8)]).toEqual([null, null, null]);
  });

  it('se queda con la mejor serie hecha, cuente o no como fallo', () => {
    expect(mejorSerie([s(22, 6), s(22, 8, 'fallo'), s(30, 10, 'pendiente'), s(null, 5)])).toEqual({ peso: 22, reps: 8, e1rm: 22 * (1 + 8 / 30) });
    expect(mejorSerie([s(50, 15), s(50, 14)])).toBeNull();
  });
});
