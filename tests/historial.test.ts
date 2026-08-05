import { describe, expect, it } from 'vitest';
import { semanasHistorial, diasDesdeUltimaVez, ventanaDias, mesHistorial } from '../src/lib/historial';
import type { Sesion } from '../src/lib/types';

const hecha = (fecha: string, diaId: string) => ({ fecha, diaId, estado: 'finalizada' }) as Sesion;
const borrador = (fecha: string, diaId: string) => ({ fecha, diaId, estado: 'borrador' }) as Sesion;

// Miércoles 12/08/2026 — su semana va del lunes 10 al domingo 16
const MIERCOLES = new Date(2026, 7, 12);

describe('calendario de semanas', () => {
  it('coloca cada sesión en su día y cuenta los entrenos de la semana', () => {
    const ses = [hecha('2026-08-10', 'd1'), hecha('2026-08-12', 'd2')];
    const [semana] = semanasHistorial(ses, {}, 1, MIERCOLES);
    expect(semana.lunes).toBe('2026-08-10');
    expect(semana.dias.map((d) => d.diaIds)).toEqual([['d1'], [], ['d2'], [], [], [], []]);
    expect(semana.entrenos).toBe(2);
  });

  it('marca como futuro lo que aún no ha llegado', () => {
    const [semana] = semanasHistorial([], {}, 1, MIERCOLES);
    expect(semana.dias.map((d) => d.futuro)).toEqual([false, false, false, true, true, true, true]);
  });

  it('dos entrenos el mismo día caben en la misma celda, sin duplicar', () => {
    const ses = [hecha('2026-08-12', 'd2'), hecha('2026-08-12', 'd3'), hecha('2026-08-12', 'd2')];
    const [semana] = semanasHistorial(ses, {}, 1, MIERCOLES);
    expect(semana.dias[2].diaIds).toEqual(['d2', 'd3']);
    expect(semana.entrenos).toBe(1);
  });

  it('los borradores no pintan y el descanso sí', () => {
    const [semana] = semanasHistorial([borrador('2026-08-11', 'd1')], { '2026-08-11': { descanso: true } }, 1, MIERCOLES);
    expect(semana.dias[1].diaIds).toEqual([]);
    expect(semana.dias[1].descanso).toBe(true);
  });

  it('devuelve las semanas de más reciente a más antigua', () => {
    const semanas = semanasHistorial([], {}, 3, MIERCOLES);
    expect(semanas.map((s) => s.lunes)).toEqual(['2026-08-10', '2026-08-03', '2026-07-27']);
  });
});

describe('ventana rodante de días', () => {
  it('devuelve atras + hoy + adelante, en orden', () => {
    const dias = ventanaDias([], {}, 5, 1, MIERCOLES);
    expect(dias).toHaveLength(7);
    expect(dias[0].fecha).toBe('2026-08-07');
    expect(dias[5].fecha).toBe('2026-08-12');
    expect(dias[6].fecha).toBe('2026-08-13');
  });

  it('solo el día siguiente queda marcado como futuro', () => {
    expect(ventanaDias([], {}, 5, 1, MIERCOLES).map((d) => d.futuro)).toEqual([
      false, false, false, false, false, false, true,
    ]);
  });

  it('coloca las sesiones en su día', () => {
    const dias = ventanaDias([hecha('2026-08-10', 'd1')], {}, 5, 1, MIERCOLES);
    expect(dias.find((d) => d.fecha === '2026-08-10')!.diaIds).toEqual(['d1']);
  });

  it('cruza el cambio de mes sin romperse', () => {
    const dias = ventanaDias([], {}, 5, 1, new Date(2026, 8, 2));
    expect(dias[0].fecha).toBe('2026-08-28');
    expect(dias[6].fecha).toBe('2026-09-03');
  });
});

describe('calendario mensual', () => {
  it('rellena con huecos hasta el primer día y completa semanas de 7', () => {
    // El 1 de agosto de 2026 cae en sábado → 5 huecos antes (lun-vie)
    const m = mesHistorial([], {}, 2026, 7, MIERCOLES);
    expect(m.celdas.slice(0, 5).every((c) => c === null)).toBe(true);
    expect(m.celdas[5]!.fecha).toBe('2026-08-01');
    expect(m.celdas.length % 7).toBe(0);
    expect(m.celdas.filter((c) => c !== null)).toHaveLength(31);
  });

  it('cuenta los entrenos del mes y los sitúa en su día', () => {
    const ses = [hecha('2026-08-03', 'd1'), hecha('2026-08-17', 'd2'), hecha('2026-07-30', 'd3')];
    const m = mesHistorial(ses, {}, 2026, 7, MIERCOLES);
    expect(m.entrenos).toBe(2);
    expect(m.celdas.find((c) => c?.fecha === '2026-08-17')!.diaIds).toEqual(['d2']);
  });

  it('febrero de un año bisiesto tiene 29 días', () => {
    const m = mesHistorial([], {}, 2028, 1, MIERCOLES);
    expect(m.celdas.filter((c) => c !== null)).toHaveLength(29);
  });
});

describe('frescura por día de rutina', () => {
  it('cuenta los días desde la última vez', () => {
    const ses = [hecha('2026-08-05', 'd1'), hecha('2026-08-10', 'd1')];
    expect(diasDesdeUltimaVez(ses, 'd1', MIERCOLES)).toBe(2);
  });

  it('hoy son 0 días', () => {
    expect(diasDesdeUltimaVez([hecha('2026-08-12', 'd3')], 'd3', MIERCOLES)).toBe(0);
  });

  it('un día que nunca se ha entrenado devuelve null', () => {
    expect(diasDesdeUltimaVez([hecha('2026-08-12', 'd3')], 'd5', MIERCOLES)).toBeNull();
  });

  it('un borrador no cuenta como entrenado', () => {
    expect(diasDesdeUltimaVez([borrador('2026-08-12', 'd5')], 'd5', MIERCOLES)).toBeNull();
  });
});
