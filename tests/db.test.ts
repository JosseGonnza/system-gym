import { describe, expect, it } from 'vitest';
import { contarDescansos, diaSugerido, diasHechosEn, siguienteDia, hoyISO } from '../src/lib/db';
import { CONFIG_INICIAL, RUTINA_1 } from '../src/lib/seed';
import type { DiaDef, Rutina, Sesion } from '../src/lib/types';

const finalizada = (fecha: string) => ({ fecha, estado: 'finalizada' }) as Sesion;
const borrador = (fecha: string) => ({ fecha, estado: 'borrador' }) as Sesion;

// Semana de referencia: lunes 08/06/2026 — el plan empieza el miércoles 10
const INICIO = '2026-06-10';
const VIERNES = new Date(2026, 5, 12);
const LUNES = new Date(2026, 5, 8);

describe('contador de descansos (lun-dom)', () => {
  it('cuenta los días pasados sin sesión finalizada, ignorando los previos al inicio del plan', () => {
    // Mié 10 sin nada (+1) · jue 11 entrenado (0) · vie 12 hoy sin marcar (0)
    expect(contarDescansos([finalizada('2026-06-11')], {}, INICIO, VIERNES)).toBe(1);
  });

  it('hoy solo cuenta si está marcado como descanso', () => {
    const diario = { '2026-06-12': { descanso: true } };
    expect(contarDescansos([finalizada('2026-06-11')], diario, INICIO, VIERNES)).toBe(2);
  });

  it('un borrador no cuenta como entreno', () => {
    expect(contarDescansos([borrador('2026-06-10'), finalizada('2026-06-11')], {}, INICIO, VIERNES)).toBe(1);
  });

  it('semana completa entrenada → 0 descansos', () => {
    const ses = [finalizada('2026-06-10'), finalizada('2026-06-11'), finalizada('2026-06-12')];
    expect(contarDescansos(ses, {}, INICIO, VIERNES)).toBe(0);
  });

  it('el lunes arranca de cero (no arrastra la semana anterior)', () => {
    const lunesSiguiente = new Date(2026, 5, 15);
    expect(contarDescansos([], {}, INICIO, lunesSiguiente)).toBe(0);
  });

  it('en lunes sin nada marcado no cuenta nada todavía', () => {
    expect(contarDescansos([], {}, '2026-06-08', LUNES)).toBe(0);
  });
});

describe('puntero de la rutina', () => {
  it('sin historial sugiere el Día 1', () => {
    expect(diaSugerido(CONFIG_INICIAL, RUTINA_1).id).toBe('d1');
  });

  it('después del Día 2 sugiere el Día 3', () => {
    const config = { ...CONFIG_INICIAL, puntero: { ultimoDiaCompletadoId: 'd2' } };
    expect(diaSugerido(config, RUTINA_1).id).toBe('d3');
  });

  it('después del Día 5 vuelve al Día 1 (secuencia, no calendario)', () => {
    const config = { ...CONFIG_INICIAL, puntero: { ultimoDiaCompletadoId: 'd5' } };
    expect(diaSugerido(config, RUTINA_1).id).toBe('d1');
  });

  it('un id desconocido (rutina cambiada) cae al Día 1 sin romper', () => {
    const config = { ...CONFIG_INICIAL, puntero: { ultimoDiaCompletadoId: 'no-existe' } };
    expect(diaSugerido(config, RUTINA_1).id).toBe('d1');
  });

  it('siguienteDia encadena d1→d2 y d5→d1', () => {
    expect(siguienteDia(RUTINA_1, 'd1').id).toBe('d2');
    expect(siguienteDia(RUTINA_1, 'd5').id).toBe('d1');
  });
});

describe('días sueltos fuera de la rueda (cardio)', () => {
  const dia = (id: string, fueraDeRueda = false) =>
    ({ id, nombre: id, emoji: '', fueraDeRueda, ejercicios: [] }) as unknown as DiaDef;
  // Rueda de 3 + un cardio suelto al final
  const rutina = {
    id: 'r',
    nombre: 'con cardio',
    dias: [dia('a'), dia('b'), dia('c'), dia('cardio', true)],
  } as Rutina;

  it('la rotación salta el día suelto', () => {
    expect(siguienteDia(rutina, 'b').id).toBe('c');
    expect(siguienteDia(rutina, 'c').id).toBe('a');
  });

  it('hacer cardio no descoloca la rueda: sigue tocando el siguiente de fuerza', () => {
    // Tras el día B tocaba C. Si mete un cardio, el puntero no se mueve (lo
    // garantiza finalizarSesion) y diaSugerido sigue proponiendo C.
    const config = { ...CONFIG_INICIAL, puntero: { ultimoDiaCompletadoId: 'b' } };
    expect(diaSugerido(config, rutina).id).toBe('c');
  });

  it('si el puntero acabara en el día suelto, la rueda arranca de nuevo', () => {
    const config = { ...CONFIG_INICIAL, puntero: { ultimoDiaCompletadoId: 'cardio' } };
    expect(diaSugerido(config, rutina).id).toBe('a');
  });

  it('sin historial propone el primer día de fuerza', () => {
    expect(diaSugerido(CONFIG_INICIAL, rutina).id).toBe('a');
  });
});

describe('días hechos en una fecha', () => {
  const hecha = (fecha: string, diaId: string) => ({ fecha, diaId, estado: 'finalizada' }) as Sesion;

  it('devuelve el día realmente entrenado, no el seleccionado', () => {
    expect(diasHechosEn([hecha('2026-06-12', 'd2')], '2026-06-12')).toEqual(['d2']);
  });

  it('ignora otras fechas y los borradores', () => {
    const ses = [hecha('2026-06-11', 'd1'), { fecha: '2026-06-12', diaId: 'd3', estado: 'borrador' } as Sesion];
    expect(diasHechosEn(ses, '2026-06-12')).toEqual([]);
  });

  it('admite dos entrenos el mismo día sin duplicar', () => {
    const ses = [hecha('2026-06-12', 'd2'), hecha('2026-06-12', 'd3'), hecha('2026-06-12', 'd2')];
    expect(diasHechosEn(ses, '2026-06-12')).toEqual(['d2', 'd3']);
  });
});

describe('fechas', () => {
  it('hoyISO usa fecha local con relleno de ceros', () => {
    expect(hoyISO(new Date(2026, 5, 10))).toBe('2026-06-10');
    expect(hoyISO(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});
