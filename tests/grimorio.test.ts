import { describe, expect, it } from 'vitest';
import {
  capitulos,
  cielo,
  marca,
  mediasSemanales,
  racha,
  tendenciaSemanal,
  estrellasMes,
  etiquetaMarcador,
  faseLunar,
  fraseMes,
  lunasSemana,
  nombreBonito,
  nombreCorto,
  romano,
  sumarDias,
  tendenciaRanura,
  ultimaVez,
} from '../src/lib/grimorio';
import type { DiaDef, EstadoSerie, Rutina, Sesion } from '../src/lib/types';

const sesion = (fecha: string, diaId: string, ejercicios: Sesion['ejercicios'] = [], estado = 'finalizada') =>
  ({ fecha, diaId, rutinaId: 'r', estado, ejercicios }) as unknown as Sesion;
const ej = (ranuraId: string, pesos: (number | null)[], sensacion?: 'facil' | 'bien' | 'duro', estado: EstadoSerie = 'completada') => ({
  ranuraId,
  nombre: ranuraId,
  sensacion,
  series: pesos.map((peso) => ({ peso, reps: 10, estado })),
});

describe('el Grimorio', () => {
  it('páginas en romano y capítulos en número normal', () => {
    expect([1, 2, 3, 4].map(romano)).toEqual(['I', 'II', 'III', 'IV']);
    expect(capitulos([sesion('2026-11-01', 'a'), sesion('2026-11-02', 'a', [], 'borrador'), sesion('2026-11-03', 'b')])).toBe(2);
  });

  it('tendencia: el máximo de cada sesión, las 6 últimas en orden, sin borradores ni series pendientes', () => {
    const s = [
      sesion('2026-10-01', 'a', [ej('hip', [20, 22.5])]),
      sesion('2026-09-01', 'a', [ej('hip', [17.5])]),
      sesion('2026-10-05', 'a', [ej('hip', [30], undefined, 'pendiente')]),
      sesion('2026-10-08', 'a', [ej('hip', [25])], 'borrador'),
      sesion('2026-10-10', 'a', [ej('otro', [99])]),
      sesion('2026-10-12', 'a', [ej('hip', [25, null])]),
    ];
    expect(tendenciaRanura(s, 'hip', false)).toEqual([17.5, 22.5, 25]);
    const muchas = Array.from({ length: 9 }, (_, i) => sesion(`2026-10-${String(i + 10).padStart(2, '0')}`, 'a', [ej('hip', [i + 1])]));
    expect(tendenciaRanura(muchas, 'hip', false)).toEqual([4, 5, 6, 7, 8, 9]);
  });

  it('tendencia por tiempo usa los segundos', () => {
    const plancha = { ranuraId: 'pl', nombre: 'pl', series: [{ peso: null, reps: null, segundos: 30, estado: 'completada' }] };
    expect(tendenciaRanura([sesion('2026-10-01', 'a', [plancha as never])], 'pl', true)).toEqual([30]);
  });

  it('última vez: la más reciente de ese día y cuántos le fueron fáciles', () => {
    const s = [
      sesion('2026-11-02', 'a', [ej('x', [1], 'duro')]),
      sesion('2026-11-09', 'a', [ej('x', [1], 'facil'), ej('y', [1], 'facil'), ej('z', [1], 'bien'), ej('w', [1])]),
      sesion('2026-11-10', 'b', [ej('x', [1], 'facil')]),
    ];
    expect(ultimaVez(s, 'a')).toEqual({ fecha: '2026-11-09', faciles: 2, valorados: 3 });
    expect(ultimaVez(s, 'c')).toBeNull();
  });

  it('marcapáginas: el nombre del entreno por su primera parte', () => {
    expect(etiquetaMarcador({ nombre: 'Glúteo + Pecho + Espalda' } as DiaDef)).toBe('GLÚTEO');
    expect(etiquetaMarcador({ nombre: 'Full body' } as DiaDef)).toBe('FULL BODY');
    expect(etiquetaMarcador({ nombre: 'Día suave' } as DiaDef)).toBe('DÍA SUAVE');
  });
});

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

describe('el diario', () => {
  const rutina = { id: 'r', dias: [{ id: 'a' }, { id: 's', fueraDeRueda: true }] } as unknown as Rutina;
  const fin = (fecha: string, diaId = 'a') => sesion(fecha, diaId);

  it('racha: semanas seguidas llegando al objetivo; la semana a medias no la rompe', () => {
    // Semanas del 19/10, 26/10 y 2/11 con 3; la del 9/11 (en curso) con 1
    const s = ['2026-10-19', '2026-10-21', '2026-10-23', '2026-10-26', '2026-10-28', '2026-10-30', '2026-11-02', '2026-11-04', '2026-11-06', '2026-11-09'].map((f) => fin(f));
    expect(racha(s, [rutina], 3, '2026-11-13')).toEqual({ actual: 3, mejor: 3 });
  });

  it('racha: un hueco la corta, el día suave no cuenta y la mejor se recuerda', () => {
    const s = [
      ...['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-14', '2026-09-15', '2026-09-16'].map((f) => fin(f)),
      fin('2026-09-21'),
      ...['2026-11-09', '2026-11-10', '2026-11-11'].map((f) => fin(f)),
      fin('2026-11-12', 's'),
    ];
    expect(racha(s, [rutina], 3, '2026-11-13')).toEqual({ actual: 1, mejor: 2 });
    expect(racha([], [rutina], 3, '2026-11-13')).toEqual({ actual: 0, mejor: 0 });
  });

  it('el cielo: 12 meses con sus días; entreno, suave o nada, y el futuro marcado', () => {
    const c = cielo([fin('2026-11-09'), fin('2026-11-10', 's')], [rutina], 2026, '2026-11-13');
    expect(c).toHaveLength(12);
    expect(c[1]).toHaveLength(28);
    expect(c[10][8]).toEqual({ fecha: '2026-11-09', tipo: 'entreno', futuro: false });
    expect(c[10][9].tipo).toBe('suave');
    expect(c[10][10].tipo).toBe('nada');
    expect(c[10][13].futuro).toBe(true);
  });

  it('medias semanales y tendencia por semana', () => {
    const e = [
      { fecha: '2026-10-19', v: 64 },
      { fecha: '2026-10-21', v: 63.6 },
      { fecha: '2026-10-27', v: 63.5 },
      { fecha: '2026-11-09', v: 63.2 },
    ];
    const m = mediasSemanales(e);
    expect(m.map((x) => x.lunes)).toEqual(['2026-10-19', '2026-10-26', '2026-11-09']);
    expect(m[0].media).toBeCloseTo(63.8);
    // (0, 63,8), (1, 63,5), (3, 63,2) → pendiente −0,9 / 4,67
    expect(tendenciaSemanal(m)).toBeCloseTo(-0.1929, 4);
    expect(tendenciaSemanal(m.slice(0, 1))).toBeNull();
  });

  it('la marca: valor de ahora, la primera y las 6 últimas', () => {
    const s = [10, 12.5, 12.5, 15, 15, 17.5, 20].map((p, i) => sesion(`2026-0${i + 3}-01`, 'a', [ej('hip', [p])]));
    expect(marca(s, 'hip', false)).toEqual({ actual: 20, primera: { fecha: '2026-03-01', v: 10 }, ultimos: [12.5, 12.5, 15, 15, 17.5, 20] });
    expect(marca(s, 'otra', false)).toBeNull();
  });
});
