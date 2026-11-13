import { describe, expect, it } from 'vitest';
import { CATALOGO } from '../src/lib/seed';
import { MUSCULOS, TRABAJA, seriesSemana, volumen } from '../src/lib/volumen';
import type { Rutina, Sesion, SerieReg } from '../src/lib/types';

const rutina = {
  id: 'r',
  nombre: 'r',
  dias: [{ id: 'a', nombre: 'A', emoji: '', ejercicios: [
    { ranuraId: 'banca', ejercicioId: 'press-banca-maquina' },
    { ranuraId: 'curl', ejercicioId: 'curl-z' },
    { ranuraId: 'cinta', ejercicioId: 'cardio-cinta' },
  ] }],
} as unknown as Rutina;

const series = (hechas: number, pendientes = 0): SerieReg[] => [
  ...Array.from({ length: hechas }, (_, i) => ({ peso: 50, reps: 8, estado: i ? 'completada' : 'fallo' }) as SerieReg),
  ...Array.from({ length: pendientes }, () => ({ peso: 50, reps: 8, estado: 'pendiente' }) as SerieReg),
];
const sesion = (fecha: string, banca: number, curl = 0, estado = 'finalizada') =>
  ({ fecha, estado, ejercicios: [
    { ranuraId: 'banca', series: series(banca, 1) },
    { ranuraId: 'curl', series: series(curl) },
    { ranuraId: 'cinta', series: series(1) },
    { ranuraId: 'vieja', series: series(3) },
  ] }) as unknown as Sesion;

describe('volumen por músculo', () => {
  it('todo ejercicio de fuerza del catálogo tiene músculo; movilidad y cardio no', () => {
    const sin = CATALOGO.filter((e) => !TRABAJA[e.id] && !['movilidad', 'cardio'].includes(e.patron) && !e.id.startsWith('cardio-'));
    expect(sin.map((e) => e.id)).toEqual([]);
    expect(Object.keys(TRABAJA).filter((id) => !CATALOGO.some((e) => e.id === id))).toEqual([]);
  });

  it('cuenta las series hechas: el principal entero y los secundarios a medias', () => {
    const s = seriesSemana([sesion('2026-11-10', 3, 3)], new Map([['banca', 'press-banca-maquina'], ['curl', 'curl-z']]), '2026-11-09');
    expect([s.pecho, s.triceps, s.hombro, s.biceps, s.espalda]).toEqual([3, 1.5, 1.5, 3, 0]);
  });

  it('la semana en curso frente a la media de las 4 anteriores; los borradores no cuentan', () => {
    const ses = [sesion('2026-11-10', 4), sesion('2026-11-11', 2, 0, 'borrador'), sesion('2026-11-03', 6), sesion('2026-10-27', 6), sesion('2026-10-12', 6), sesion('2026-10-05', 9)];
    const pecho = volumen(ses, [rutina], '2026-11-13').find((f) => f.musculo === 'pecho')!;
    expect([pecho.esta, pecho.media]).toEqual([4, 4.5]);
    expect(volumen([], [rutina], '2026-11-13').map((f) => f.musculo)).toEqual(MUSCULOS.map((m) => m.id));
  });
});
