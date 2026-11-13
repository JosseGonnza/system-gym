import { describe, expect, it } from 'vitest';
import { SEMANAS, anual, nivel } from '../src/lib/anual';
import type { Sesion } from '../src/lib/types';

const hecha = (fecha: string, duracionMin: number | null = 50) => ({ fecha, duracionMin, estado: 'finalizada' }) as Sesion;
const borrador = (fecha: string) => ({ fecha, duracionMin: 40, estado: 'borrador' }) as Sesion;

// Viernes 13/11/2026: su semana va del lunes 9 al domingo 15.
const HOY = '2026-11-13';

describe('año de entrenos', () => {
  it('53 semanas de lunes a domingo, la última es la de hoy', () => {
    const a = anual([], HOY, 3);
    expect(a.semanas).toHaveLength(SEMANAS);
    expect(a.semanas.every((s) => s.length === 7)).toBe(true);
    expect(a.semanas[0][0].fecha).toBe('2025-11-10');
    expect(a.semanas[SEMANAS - 1].map((c) => c.fecha)).toEqual(['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15']);
    expect(a.semanas[SEMANAS - 1].map((c) => c.futuro)).toEqual([false, false, false, false, false, true, true]);
  });

  it('el tono sale de los minutos del día y dos sesiones el mismo día se suman', () => {
    expect([0, 10, 30, 45, 60, 90].map(nivel)).toEqual([0, 1, 2, 3, 4, 4]);
    const a = anual([hecha('2026-11-10', 30), hecha('2026-11-10', 20), hecha('2026-11-11', 40)], HOY, 3);
    const s = a.semanas[SEMANAS - 1];
    expect([s[1].min, s[1].nivel, s[2].nivel]).toEqual([50, 3, 2]);
  });

  it('un entreno sin duración cuenta con el tono más flojo y los borradores no cuentan', () => {
    const s = anual([hecha('2026-11-10', null), borrador('2026-11-11')], HOY, 3).semanas[SEMANAS - 1];
    expect([s[1].nivel, s[2].nivel]).toEqual([1, 0]);
  });

  it('cuenta los días entrenados del último año, no las sesiones', () => {
    const a = anual([hecha('2026-11-10'), hecha('2026-11-10'), hecha('2025-11-14'), hecha('2025-11-13')], HOY, 3);
    expect(a.entrenos).toBe(2);
  });

  it('la racha cuenta semanas seguidas cumpliendo y la semana en curso no la rompe', () => {
    const ses = ['2026-10-26', '2026-10-28', '2026-10-30', '2026-11-02', '2026-11-04', '2026-11-06', '2026-11-10'].map((f) => hecha(f));
    expect(anual(ses, HOY, 3).racha).toBe(2);
    expect(anual([...ses, hecha('2026-11-11'), hecha('2026-11-12')], HOY, 3).racha).toBe(3);
    expect(anual(ses.filter((s) => s.fecha !== '2026-11-04'), HOY, 3).racha).toBe(0);
  });

  it('pone el nombre del mes donde empieza y no amontona el primero', () => {
    const a = anual([], HOY, 3);
    expect(a.meses.slice(0, 2)).toEqual([{ col: 0, mes: 10 }, { col: 3, mes: 11 }]);
    expect(a.meses[a.meses.length - 1]).toEqual({ col: 51, mes: 10 });
    expect(anual([], '2026-11-27', 3).meses[0]).toEqual({ col: 1, mes: 11 });
  });
});
