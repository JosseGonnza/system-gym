import { describe, expect, it } from 'vitest';
import { contadores, diaDelPlan, recordsRecientes, semanaActual, serieMedida, subidasMotor } from '../src/lib/trayecto';
import type { FilaSerie } from '../src/lib/datos';
import type { Rutina, SerieReg, Sesion } from '../src/lib/types';

const rutina = {
  id: 'r',
  nombre: 'Rueda',
  dias: [
    { id: 'a', nombre: 'Empuje', emoji: '', ejercicios: [] },
    { id: 'b', nombre: 'Tirón', emoji: '', ejercicios: [] },
    { id: 'cardio', nombre: 'Cardio', emoji: '', fueraDeRueda: true, ejercicios: [] },
  ],
} as unknown as Rutina;

const serie = (peso: number | null, reps: number | null, extra: Partial<SerieReg> = {}): SerieReg =>
  ({ peso, reps, segundos: null, estado: 'completada', ...extra }) as SerieReg;

let n = 0;
const sesion = (fecha: string, diaId: string, ejercicios: [string, SerieReg[]][] = [], extra: Partial<Sesion> = {}): Sesion => ({
  id: `s${++n}`,
  fecha,
  inicioISO: `${fecha}T10:00:00.000Z`,
  finISO: `${fecha}T11:00:00.000Z`,
  rutinaId: 'r',
  diaId,
  estado: 'finalizada',
  suenoH: null,
  energia: null,
  duracionMin: null,
  notas: '',
  ejercicios: ejercicios.map(([nombre, series]) => ({ ranuraId: nombre, nombre, series })),
  ...extra,
});

describe('diaDelPlan', () => {
  it('el día que empieza el plan es el día 1', () => {
    expect(diaDelPlan('2026-06-10', '2026-06-10')).toBe(1);
    expect(diaDelPlan('2026-06-10', '2026-11-19')).toBe(163);
  });
});

describe('semanaActual', () => {
  const sesiones = [
    sesion('2026-11-16', 'a'),
    sesion('2026-11-17', 'cardio', [['Cinta', [serie(null, null, { segundos: 1800 })]]]),
    sesion('2026-11-18', 'b'),
    sesion('2026-11-19', 'a', [], { estado: 'borrador' }),
    sesion('2026-11-15', 'b'),
  ];
  const s = semanaActual(sesiones, [rutina], '2026-11-19', 4);

  it('cuenta el gym y el cardio de lunes a domingo, sin borradores', () => {
    expect(s.gym).toBe(2);
    expect(s.objetivo).toBe(4);
    expect(s.cardioSesiones).toBe(1);
    expect(s.cardioMin).toBe(30);
  });

  it('marca cada día con lo que se hizo, hoy y lo que queda', () => {
    expect(s.dias.map((d) => d.fecha)).toEqual(['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22']);
    expect(s.dias[0]).toMatchObject({ letra: 'L', diaId: 'a', cardio: false });
    expect(s.dias[1]).toMatchObject({ diaId: null, cardio: true });
    expect(s.dias[3]).toMatchObject({ hoy: true, diaId: null, futuro: false });
    expect(s.dias[4]).toMatchObject({ letra: 'V', futuro: true });
  });
});

describe('serieMedida', () => {
  it('compara la última medida con la primera', () => {
    const m = serieMedida([
      { fecha: '2026-11-16', valor: 71.4 },
      { fecha: '2026-06-11', valor: 68 },
      { fecha: '2026-08-20', valor: 70.6 },
    ]);
    expect(m).toMatchObject({ actual: 71.4, primera: 68, desde: '2026-06-11', delta: 3.4 });
    expect(m!.puntos.map((p) => p.fecha)).toEqual(['2026-06-11', '2026-08-20', '2026-11-16']);
  });

  it('sin medidas no hay serie', () => {
    expect(serieMedida([])).toBeNull();
  });
});

const historia = [
  sesion('2026-06-01', 'a', [['Prensa', [serie(40, 10), serie(40, 9)]], ['Curl', [serie(10, 10)]], ['Laterales', [serie(5, 12)]]]),
  sesion('2026-07-01', 'a', [['Prensa', [serie(45, 8)]], ['Curl', [serie(10, 11)]], ['Laterales', [serie(4, 12)]]]),
  sesion('2026-08-01', 'a', [['Prensa', [serie(45, 10), serie(50, 6, { estado: 'pendiente' })]], ['Plancha', [serie(null, null, { segundos: 60 })]]]),
  sesion('2026-09-01', 'a', [['Curl', [serie(12.5, 8, { estado: 'corta' })]]]),
  sesion('2026-10-01', 'a', [['Prensa', [serie(45, 11)]], ['Curl', [serie(12.5, 9)]]]),
  sesion('2026-06-05', 'b', [['Remo brazo', [serie(20, 10)]]]),
  sesion('2026-06-15', 'b', [['Remo brazo', [serie(65, 10)]]]),
];

describe('subidasMotor', () => {
  it('de la primera sesión a la última, solo lo que ha subido y de más a menos', () => {
    expect(subidasMotor(historia, 4)).toEqual([
      { nombre: 'Prensa', desde: 40, hasta: 45 },
      { nombre: 'Curl', desde: 10, hasta: 12.5 },
    ]);
  });

  it('con menos de 4 sesiones el primer peso aún es de calibrar: no cuenta', () => {
    expect(subidasMotor(historia, 4).map((x) => x.nombre)).not.toContain('Remo brazo');
  });

  it('se queda con los primeros que pidas', () => {
    expect(subidasMotor(historia, 1)).toHaveLength(1);
  });
});

describe('recordsRecientes', () => {
  it('cada vez que se supera el máximo anterior, lo último primero', () => {
    expect(recordsRecientes(historia, 3)).toEqual([
      { nombre: 'Curl', kg: 12.5, fecha: '2026-09-01' },
      { nombre: 'Prensa', kg: 45, fecha: '2026-07-01' },
      { nombre: 'Remo brazo', kg: 65, fecha: '2026-06-15' },
    ]);
  });
});

describe('contadores', () => {
  it('días, series, reps, toneladas, horas y km de cinta', () => {
    const cardio = sesion('2026-11-17', 'cardio', [['Cinta', [serie(null, null, { segundos: 2400, cardio: { distanciaKm: 3.4 } as SerieReg['cardio'] })]]]);
    const borrador = sesion('2026-11-19', 'a', [], { estado: 'borrador' });
    const filas = [
      { reps: 10, tonelaje: 400 },
      { reps: 8, tonelaje: 360 },
      { reps: null, tonelaje: null },
    ] as FilaSerie[];
    expect(contadores([...historia, cardio, borrador], filas)).toEqual({
      dias: 8,
      series: 3,
      reps: 18,
      toneladas: 0.8,
      horas: 8,
      km: 3.4,
    });
  });
});
