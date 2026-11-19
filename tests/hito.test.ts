import { describe, expect, it } from 'vitest';
import { proximoHito } from '../src/lib/grimorio';
import type { DiaDef, EjercicioDef, EstadoSerie, Sesion } from '../src/lib/types';

const sesion = (fecha: string, ejercicios: Sesion['ejercicios'], estado = 'finalizada') =>
  ({ fecha, diaId: 'ypa', rutinaId: 'r', estado, ejercicios }) as unknown as Sesion;
const ej = (ranuraId: string, pesos: number[], estado: EstadoSerie = 'completada') => ({
  ranuraId,
  nombre: ranuraId,
  series: pesos.map((peso) => ({ peso, reps: 10, estado })),
});
const def = (ranuraId: string, nombre: string, tipo: EjercicioDef['tipoProgresion'] = 'sensacion') =>
  ({ ranuraId, nombre, tipoProgresion: tipo }) as EjercicioDef;
const dia = { id: 'ypa', ejercicios: [def('hip', 'Hip thrust'), def('femoral', 'Curl femoral sentado'), def('plancha', 'Plancha', 'tiempo')] } as DiaDef;

const sesiones = [
  sesion('2026-11-01', [ej('hip', [20, 20]), ej('femoral', [25])]),
  sesion('2026-11-08', [ej('hip', [17.5]), ej('femoral', [27.5])]),
  sesion('2026-11-15', [ej('hip', [22.5])], 'borrador'),
  sesion('2026-11-16', [ej('femoral', [30, 30], 'pendiente')]),
];

describe('proximoHito', () => {
  it('lo que le queda para su récord, en el ejercicio que más cerca está', () => {
    const hoy = { hip: 17.5, femoral: 25 } as Record<string, number>;
    expect(proximoHito(sesiones, dia, (e) => hoy[e.ranuraId] ?? null)).toEqual({ tipo: 'cerca', nombre: 'Hip thrust', kg: 20, falta: 2.5 });
  });

  it('si el motor le propone más que su récord, hoy toca récord', () => {
    const hoy = { hip: 17.5, femoral: 30 } as Record<string, number>;
    expect(proximoHito(sesiones, dia, (e) => hoy[e.ranuraId] ?? null)).toEqual({ tipo: 'record', nombre: 'Curl femoral sentado', kg: 30, falta: 0 });
  });

  it('igualar el récord también cuenta como hito', () => {
    const hoy = { hip: 20, femoral: 25 } as Record<string, number>;
    expect(proximoHito(sesiones, dia, (e) => hoy[e.ranuraId] ?? null)).toEqual({ tipo: 'igual', nombre: 'Hip thrust', kg: 20, falta: 0 });
  });

  it('sin historial ni peso propuesto no hay hito', () => {
    expect(proximoHito([], dia, () => 20)).toBeNull();
    expect(proximoHito(sesiones, dia, () => null)).toBeNull();
  });
});
