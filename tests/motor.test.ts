import { describe, expect, it } from 'vitest';
import { sugerir, historialDeRanura, type PuntoHistorial } from '../src/lib/motor';
import type { EjercicioDef, SerieReg } from '../src/lib/types';

const INCR_MIN = 2.5;

const lineal: EjercicioDef = { ranuraId: 'd1-sentadilla', nombre: 'Sentadilla', tipoProgresion: 'lineal', series: 4, repsObjetivo: 5, incrementoKg: 2.5, restSeg: 180 };
const muerto: EjercicioDef = { ranuraId: 'd3-muerto', nombre: 'Peso muerto', tipoProgresion: 'lineal', series: 4, repsObjetivo: 4, incrementoKg: 5, restSeg: 180 };
const doble: EjercicioDef = { ranuraId: 'd1-rumano', nombre: 'Peso muerto rumano', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 90 };
const dominadas: EjercicioDef = { ranuraId: 'd3-dominadas', nombre: 'Dominadas', tipoProgresion: 'pesoCorporal', series: 3, repsObjetivo: [5, 10], incrementoKg: 2.5, restSeg: 90 };
const plancha: EjercicioDef = { ranuraId: 'd1-plancha', nombre: 'Plancha', tipoProgresion: 'tiempo', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 60 };
const abdomen: EjercicioDef = { ranuraId: 'd5-abdomen', nombre: 'Elevación de piernas', tipoProgresion: 'libre', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 60 };

const serie = (peso: number | null, reps: number | null, estado: SerieReg['estado'], extra: Partial<SerieReg> = {}): SerieReg => ({ peso, reps, estado, ...extra });
const hace = (dias: number) => new Date(Date.now() - dias * 86_400_000).toISOString().slice(0, 10);
const sesionDe = (dias: number, series: SerieReg[]): PuntoHistorial => ({ fecha: hace(dias), series });

describe('calibración (sin historial)', () => {
  it('lineal: no sugiere peso, avisa de buscar carga con 2-3 reps en recámara', () => {
    const s = sugerir(lineal, [], INCR_MIN);
    expect(s.peso).toBeNull();
    expect(s.aviso).toMatch(/recámara/);
  });

  it('doble: pre-rellena las reps del suelo del rango', () => {
    const s = sugerir(doble, [], INCR_MIN);
    expect(s.peso).toBeNull();
    expect(s.reps).toBe(8);
  });
});

describe('progresión lineal', () => {
  const exito60 = sesionDe(3, [serie(60, 5, 'completada'), serie(60, 5, 'completada'), serie(60, 5, 'completada'), serie(60, 5, 'completada')]);
  const fallo60 = sesionDe(3, [serie(60, 5, 'completada'), serie(60, 4, 'corta'), serie(60, 5, 'completada'), serie(60, 3, 'corta')]);

  it('todas las series completas → +incremento', () => {
    expect(sugerir(lineal, [exito60], INCR_MIN).peso).toBe(62.5);
  });

  it('una sesión fallada → repite peso', () => {
    expect(sugerir(lineal, [fallo60], INCR_MIN).peso).toBe(60);
  });

  it('dos sesiones falladas con el mismo peso → deload −10% redondeado al disco', () => {
    const falloPrevio = sesionDe(7, [serie(60, 4, 'corta'), serie(60, 4, 'corta'), serie(60, 4, 'corta'), serie(60, 3, 'corta')]);
    const s = sugerir(lineal, [fallo60, falloPrevio], INCR_MIN);
    expect(s.peso).toBe(55); // 60 × 0,9 = 54 → redondeado a 2,5
    expect(s.aviso).toMatch(/Dos sesiones falladas/);
  });

  it('deload respeta el incremento del ejercicio (peso muerto va de 5 en 5)', () => {
    const fallo100 = (dias: number) => sesionDe(dias, [serie(100, 3, 'corta'), serie(100, 3, 'corta'), serie(100, 3, 'corta'), serie(100, 2, 'corta')]);
    expect(sugerir(muerto, [fallo100(3), fallo100(7)], INCR_MIN).peso).toBe(90);
  });

  it('serie marcada al fallo no cuenta como completa → repite peso', () => {
    const conFallo = sesionDe(3, [serie(60, 5, 'completada'), serie(60, 5, 'fallo'), serie(60, 5, 'completada'), serie(60, 5, 'completada')]);
    expect(sugerir(lineal, [conFallo], INCR_MIN).peso).toBe(60);
  });
});

describe('progresión doble', () => {
  it('tope del rango en todas → sube peso y reps al suelo', () => {
    const tope = sesionDe(4, [serie(40, 12, 'completada'), serie(40, 12, 'completada'), serie(40, 12, 'completada')]);
    const s = sugerir(doble, [tope], INCR_MIN);
    expect(s.peso).toBe(42.5);
    expect(s.reps).toBe(8);
  });

  it('sin tope → mismo peso y una rep más', () => {
    const medio = sesionDe(4, [serie(40, 10, 'completada'), serie(40, 9, 'completada'), serie(40, 8, 'fallo')]);
    const s = sugerir(doble, [medio], INCR_MIN);
    expect(s.peso).toBe(40);
    expect(s.reps).toBe(11);
  });

  it('las reps sugeridas nunca pasan del tope del rango', () => {
    const casi = sesionDe(4, [serie(40, 12, 'completada'), serie(40, 12, 'completada'), serie(40, 11, 'corta')]);
    expect(sugerir(doble, [casi], INCR_MIN).reps).toBe(12);
  });
});

describe('peso corporal', () => {
  it('tope del rango sin lastre → empieza a sumar lastre y reps al suelo', () => {
    const tope = sesionDe(4, [serie(null, 10, 'completada'), serie(null, 10, 'completada'), serie(null, 10, 'completada')]);
    const s = sugerir(dominadas, [tope], INCR_MIN);
    expect(s.lastreKg).toBe(2.5);
    expect(s.reps).toBe(5);
  });

  it('tope del rango con lastre → más lastre', () => {
    const conLastre = sesionDe(4, [
      serie(null, 10, 'completada', { lastreKg: 2.5 }),
      serie(null, 10, 'completada', { lastreKg: 2.5 }),
      serie(null, 10, 'completada', { lastreKg: 2.5 }),
    ]);
    expect(sugerir(dominadas, [conLastre], INCR_MIN).lastreKg).toBe(5);
  });

  it('sin tope → progresa por reps, sin lastre', () => {
    const medio = sesionDe(4, [serie(null, 8, 'completada'), serie(null, 7, 'completada'), serie(null, 6, 'fallo')]);
    const s = sugerir(dominadas, [medio], INCR_MIN);
    expect(s.reps).toBe(9);
    expect(s.lastreKg).toBeNull();
  });
});

describe('tiempo y libre', () => {
  it('tiempo: sugiere +5 s sobre el mejor registro', () => {
    const pl = sesionDe(2, [
      serie(null, null, 'completada', { segundos: 45 }),
      serie(null, null, 'completada', { segundos: 40 }),
      serie(null, null, 'fallo', { segundos: 35 }),
    ]);
    expect(sugerir(plancha, [pl], INCR_MIN).segundos).toBe(50);
  });

  it('libre: sin auto-progresión', () => {
    const s = sugerir(abdomen, [], INCR_MIN);
    expect(s.peso).toBeNull();
    expect(s.reps).toBeNull();
    expect(s.texto).toMatch(/apunta/i);
  });
});

describe('parón (+14 días sin tocar la ranura)', () => {
  const exitoViejo = sesionDe(20, [serie(60, 5, 'completada'), serie(60, 5, 'completada'), serie(60, 5, 'completada'), serie(60, 5, 'completada')]);

  it('lineal: no sube aunque la última sesión fuese un éxito, y avisa', () => {
    const s = sugerir(lineal, [exitoViejo], INCR_MIN);
    expect(s.peso).toBe(60);
    expect(s.aviso).toMatch(/parón/);
  });

  it('doble: tampoco sube con el rango al tope', () => {
    const topeViejo = sesionDe(20, [serie(40, 12, 'completada'), serie(40, 12, 'completada'), serie(40, 12, 'completada')]);
    const s = sugerir(doble, [topeViejo], INCR_MIN);
    expect(s.peso).toBe(40);
    expect(s.aviso).toMatch(/parón/);
  });

  it('tiempo: repite segundos sin sumar', () => {
    const plViejo = sesionDe(20, [serie(null, null, 'completada', { segundos: 45 })]);
    expect(sugerir(plancha, [plViejo], INCR_MIN).segundos).toBe(45);
  });
});

describe('historial por ranura', () => {
  it('solo cuenta sesiones finalizadas, filtra por ranura y ordena de reciente a antigua', () => {
    const sesiones = [
      { fecha: '2026-06-01', estado: 'finalizada', ejercicios: [{ ranuraId: 'a', series: [serie(60, 5, 'completada')] }] },
      { fecha: '2026-06-05', estado: 'borrador', ejercicios: [{ ranuraId: 'a', series: [serie(70, 5, 'completada')] }] },
      { fecha: '2026-06-08', estado: 'finalizada', ejercicios: [{ ranuraId: 'b', series: [serie(30, 8, 'completada')] }] },
      { fecha: '2026-06-09', estado: 'finalizada', ejercicios: [{ ranuraId: 'a', series: [serie(62.5, 5, 'completada')] }] },
    ];
    const h = historialDeRanura(sesiones, 'a');
    expect(h).toHaveLength(2);
    expect(h[0].fecha).toBe('2026-06-09');
    expect(h[0].series[0].peso).toBe(62.5);
    expect(h[1].fecha).toBe('2026-06-01');
  });

  it('el mismo ejercicio en dos días progresa por separado (ranuras distintas)', () => {
    const sesiones = [
      { fecha: '2026-06-08', estado: 'finalizada', ejercicios: [{ ranuraId: 'd2-banca', series: [serie(70, 5, 'completada')] }] },
      { fecha: '2026-06-09', estado: 'finalizada', ejercicios: [{ ranuraId: 'd4-banca-ligero', series: [serie(50, 10, 'completada')] }] },
    ];
    expect(historialDeRanura(sesiones, 'd2-banca')).toHaveLength(1);
    expect(historialDeRanura(sesiones, 'd2-banca')[0].series[0].peso).toBe(70);
    expect(historialDeRanura(sesiones, 'd4-banca-ligero')[0].series[0].peso).toBe(50);
  });
});
