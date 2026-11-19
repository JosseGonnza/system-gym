import { describe, expect, it } from 'vitest';
import { haceDias, resumenDia, ultimasReps } from '../src/lib/rueda';
import type { DiaDef, SerieReg, Sesion } from '../src/lib/types';

const serie = (reps: number | null, estado: SerieReg['estado'] = 'completada'): SerieReg =>
  ({ peso: 50, reps, segundos: null, estado }) as SerieReg;

const sesion = (fecha: string, ranuraId: string, series: SerieReg[], estado: Sesion['estado'] = 'finalizada'): Sesion => ({
  id: `${fecha}-${ranuraId}`,
  fecha,
  inicioISO: `${fecha}T10:00:00.000Z`,
  finISO: null,
  rutinaId: 'r',
  diaId: 'a',
  estado,
  suenoH: null,
  energia: null,
  duracionMin: null,
  notas: '',
  ejercicios: [{ ranuraId, nombre: ranuraId, series }],
});

describe('ultimasReps', () => {
  const sesiones = [
    sesion('2026-11-03', 'prensa', [serie(10), serie(9), serie(9)]),
    sesion('2026-11-10', 'prensa', [serie(8), serie(8), serie(7, 'corta'), serie(null, 'pendiente')]),
    sesion('2026-11-17', 'prensa', [serie(12)], 'borrador'),
    sesion('2026-11-12', 'jalon', [serie(8)]),
  ];

  it('las reps de la última sesión acabada de esa ranura, sin las pendientes', () => {
    expect(ultimasReps(sesiones, 'prensa')).toEqual([8, 8, 7]);
  });

  it('una ranura sin estrenar no tiene reps', () => {
    expect(ultimasReps(sesiones, 'rumano')).toEqual([]);
  });
});

describe('haceDias', () => {
  it('dice cuándo fue la última vez en corto', () => {
    expect(haceDias(null)).toBe('sin estrenar');
    expect(haceDias(0)).toBe('hoy');
    expect(haceDias(1)).toBe('ayer');
    expect(haceDias(6)).toBe('hace 6 d');
  });
});

describe('resumenDia', () => {
  const dia = {
    id: 'pierna',
    nombre: 'Pierna',
    emoji: '',
    ejercicios: [{ series: 4 }, { series: 3 }, { series: 3 }],
  } as unknown as DiaDef;

  it('ejercicios, series y la última vez', () => {
    expect(resumenDia(dia, '2026-11-16')).toBe('3 ejercicios · 10 series · último el 16 nov');
    expect(resumenDia(dia, null)).toBe('3 ejercicios · 10 series · sin estrenar');
  });
});
