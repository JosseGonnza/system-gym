import { describe, expect, it } from 'vitest';
import type { FilaSerie } from '../src/lib/datos';
import { fuerzaEjercicio, mediaMovil, musculoSemanal, porDia, records, semanal } from '../src/lib/panel-datos';

let n = 0;
const fila = (p: Partial<FilaSerie>): FilaSerie =>
  ({
    id: `f${++n}`,
    sesionId: 's1',
    fecha: '2026-11-16',
    ejercicio: 'Prensa',
    musculo: 'Cuádriceps',
    kgReal: 100,
    reps: 10,
    e1rm: 133.3,
    tonelaje: 1000,
    estado: 'completada',
    ...p,
  }) as FilaSerie;

describe('semanal', () => {
  it('suma por semana de lunes a domingo y rellena las semanas vacías', () => {
    const s = semanal([
      fila({ fecha: '2026-11-02', sesionId: 'a', tonelaje: 500 }),
      fila({ fecha: '2026-11-04', sesionId: 'b', tonelaje: 300 }),
      fila({ fecha: '2026-11-04', sesionId: 'b', tonelaje: 200 }),
      fila({ fecha: '2026-11-17', sesionId: 'c', tonelaje: 100, reps: null }),
    ]);
    expect(s.map((x) => x.lunes)).toEqual(['2026-11-02', '2026-11-09', '2026-11-16']);
    expect(s[0]).toMatchObject({ tonelaje: 1000, series: 3, sesiones: 2, dias: 2 });
    expect(s[1]).toMatchObject({ tonelaje: 0, series: 0, sesiones: 0, dias: 0 });
    expect(s[2]).toMatchObject({ tonelaje: 100, series: 1, dias: 1 });
  });

  it('con un periodo, cubre todas sus semanas aunque no haya filas al principio o al final', () => {
    const s = semanal([fila({ fecha: '2026-11-10' })], '2026-10-27', '2026-11-20');
    expect(s.map((x) => x.lunes)).toEqual(['2026-10-26', '2026-11-02', '2026-11-09', '2026-11-16']);
    expect(s.map((x) => x.series)).toEqual([0, 0, 1, 0]);
  });

  it('sin filas no hay semanas', () => {
    expect(semanal([])).toEqual([]);
  });
});

describe('fuerzaEjercicio', () => {
  it('el mejor 1RM de cada sesión, en orden, marcando cuándo fue récord', () => {
    const f = fuerzaEjercicio(
      [
        fila({ sesionId: 'b', fecha: '2026-11-09', e1rm: 120, kgReal: 90, reps: 10 }),
        fila({ sesionId: 'a', fecha: '2026-11-02', e1rm: 110, kgReal: 85, reps: 9 }),
        fila({ sesionId: 'a', fecha: '2026-11-02', e1rm: 115, kgReal: 85, reps: 11 }),
        fila({ sesionId: 'c', fecha: '2026-11-16', e1rm: 118, kgReal: 95, reps: 6 }),
        fila({ sesionId: 'c', fecha: '2026-11-16', ejercicio: 'Jalón', e1rm: 200 }),
        fila({ sesionId: 'd', fecha: '2026-11-17', e1rm: null }),
      ],
      'Prensa',
    );
    expect(f).toEqual([
      { fecha: '2026-11-02', e1rm: 115, kg: 85, reps: 11, record: true },
      { fecha: '2026-11-09', e1rm: 120, kg: 90, reps: 10, record: true },
      { fecha: '2026-11-16', e1rm: 118, kg: 95, reps: 6, record: false },
    ]);
  });
});

describe('records', () => {
  it('por ejercicio: el mayor kg real, el mejor 1RM y la última vez, lo reciente primero', () => {
    const r = records([
      fila({ fecha: '2026-11-02', kgReal: 90, reps: 8, e1rm: 114 }),
      fila({ fecha: '2026-11-09', kgReal: 95, reps: 5, e1rm: 110.8 }),
      fila({ fecha: '2026-11-16', ejercicio: 'Jalón', kgReal: 70, reps: 8, e1rm: 88.7 }),
      fila({ fecha: '2026-11-17', ejercicio: 'Plancha', kgReal: null, reps: null, e1rm: null }),
    ]);
    expect(r).toEqual([
      { ejercicio: 'Jalón', kg: 70, kgReps: 8, kgFecha: '2026-11-16', e1rm: 88.7, e1rmFecha: '2026-11-16', sesiones: 1, ultima: '2026-11-16' },
      { ejercicio: 'Prensa', kg: 95, kgReps: 5, kgFecha: '2026-11-09', e1rm: 114, e1rmFecha: '2026-11-02', sesiones: 1, ultima: '2026-11-09' },
    ]);
  });
});

describe('musculoSemanal', () => {
  it('series por semana de media en el periodo, sin cardio ni sin músculo, de más a menos', () => {
    const m = musculoSemanal([
      fila({ fecha: '2026-11-02', musculo: 'Pecho' }),
      fila({ fecha: '2026-11-03', musculo: 'Pecho' }),
      fila({ fecha: '2026-11-16', musculo: 'Pecho' }),
      fila({ fecha: '2026-11-16', musculo: 'Espalda' }),
      fila({ fecha: '2026-11-16', musculo: 'Cardio' }),
      fila({ fecha: '2026-11-16', musculo: '' }),
    ]);
    expect(m).toEqual([
      { musculo: 'Pecho', media: 1, total: 3 },
      { musculo: 'Espalda', media: 0.3, total: 1 },
    ]);
  });
});

describe('porDia', () => {
  it('tonelaje de cada día entrenado', () => {
    const d = porDia([fila({ fecha: '2026-11-02', tonelaje: 500 }), fila({ fecha: '2026-11-02', tonelaje: null }), fila({ fecha: '2026-11-03', tonelaje: 200 })]);
    expect([...d]).toEqual([['2026-11-02', 500], ['2026-11-03', 200]]);
  });
});

describe('mediaMovil', () => {
  it('la media de lo medido en los 7 días hasta cada fecha', () => {
    const m = mediaMovil([
      { fecha: '2026-11-01', v: 70 },
      { fecha: '2026-11-05', v: 72 },
      { fecha: '2026-11-10', v: 71 },
    ]);
    expect(m).toEqual([
      { fecha: '2026-11-01', v: 70 },
      { fecha: '2026-11-05', v: 71 },
      { fecha: '2026-11-10', v: 71.5 },
    ]);
  });
});
