import { describe, expect, it } from 'vitest';
import { estrellasMes, faseLunar, fraseMes, lunasSemana, nombreBonito, nombreCorto, sumarDias } from '../src/lib/grimorio';
import type { Rutina, Sesion } from '../src/lib/types';

describe('fase lunar', () => {
  it('el 13/11/2026 es luna creciente (la que pone la spec)', () => {
    expect(faseLunar(new Date(2026, 10, 13, 12))).toBe('luna creciente');
  });

  it('acierta lunas llenas y nuevas conocidas', () => {
    // Luna llena del 24/11/2026 y nueva del 9/11/2026 (efemérides)
    expect(faseLunar(new Date(2026, 10, 24, 12))).toBe('luna llena');
    expect(faseLunar(new Date(2026, 10, 9, 12))).toBe('luna nueva');
  });

  it('funciona antes de la fecha de referencia', () => {
    expect(FASE_VALIDA).toContain(faseLunar(new Date(1990, 3, 1)));
  });
});
const FASE_VALIDA = ['luna nueva', 'luna creciente', 'cuarto creciente', 'gibosa creciente', 'luna llena', 'gibosa menguante', 'cuarto menguante', 'luna menguante'];

describe('nombres de los días', () => {
  it('de "A + B + C" a frase', () => {
    expect(nombreBonito('Glúteo + Pecho + Espalda')).toBe('Glúteo, pecho y espalda');
    expect(nombreBonito('Femoral + Hombro')).toBe('Femoral y hombro');
    expect(nombreBonito('Full body')).toBe('Full body');
  });

  it('el corto se queda con las dos primeras partes', () => {
    expect(nombreCorto('Femoral + Hombro + Brazos')).toBe('Femoral y hombro');
    expect(nombreCorto('Día suave')).toBe('Día suave');
  });
});

describe('las lunas de la semana', () => {
  const rutina = {
    id: 'r',
    dias: [
      { id: 'a', fueraDeRueda: false },
      { id: 's', fueraDeRueda: true },
    ],
  } as unknown as Rutina;
  const ses = (fecha: string, diaId: string, estado = 'finalizada') => ({ fecha, diaId, rutinaId: 'r', estado }) as Sesion;

  it('siete días acabando hoy, con su letra', () => {
    const { lunas } = lunasSemana([], [rutina], '2026-11-13');
    expect(lunas.map((l) => l.fecha)).toEqual(['2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13']);
    expect(lunas.map((l) => l.letra).join('')).toBe('SDLMXJV');
    expect(lunas.filter((l) => l.hoy).map((l) => l.fecha)).toEqual(['2026-11-13']);
  });

  it('llena si entrenó, suave si solo hizo el día suave, vacía si no; los borradores no cuentan', () => {
    const s = [ses('2026-11-09', 'a'), ses('2026-11-10', 's'), ses('2026-11-11', 'a', 'borrador'), ses('2026-11-12', 's'), ses('2026-11-12', 'a')];
    const { lunas, entrenos } = lunasSemana(s, [rutina], '2026-11-13');
    expect(lunas.map((l) => l.tipo)).toEqual(['vacia', 'vacia', 'llena', 'suave', 'vacia', 'llena', 'vacia']);
    expect(entrenos).toBe(2);
  });
});

describe('las estrellas del mes', () => {
  it('apagadas hasta lo que da el mes a su ritmo', () => {
    // Noviembre: 30 días a 3 por semana ≈ 13
    expect(estrellasMes(5, 3, 2026, 10)).toEqual({ on: 5, total: 13 });
  });

  it('si pasa del objetivo, todas encendidas; nunca más de 16', () => {
    expect(estrellasMes(14, 3, 2026, 10)).toEqual({ on: 14, total: 14 });
    expect(estrellasMes(25, 3, 2026, 10)).toEqual({ on: 16, total: 16 });
  });
});

describe('frases del mes', () => {
  it('sin entrenos, una de ánimo; con entrenos, una que no falla con el número', () => {
    expect(fraseMes(0, '2026-11-13')).toMatch(/estrella/i);
    for (let i = 0; i < 10; i++) {
      const f = fraseMes(5, sumarDias('2026-11-13', i));
      expect(f.length).toBeGreaterThan(10);
      expect(f).not.toMatch(/undefined/);
    }
  });

  it('el número va en letra y concuerda en singular', () => {
    const una = Array.from({ length: 5 }, (_, i) => fraseMes(1, sumarDias('2026-01-01', i)));
    expect(una).toContain('Una estrella encendida. El bosque lo nota.');
  });
});
