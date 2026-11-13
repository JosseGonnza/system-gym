import { describe, expect, it } from 'vitest';
import { CARTA, COMIDAS, diaCiclo, planDia, sumarDias } from '../src/lib/casa';
import type { DiaComidas } from '../src/lib/comidas';
import { semanasPD, tendencia, veredicto } from '../src/lib/peso-dieta';
import type { Mediciones } from '../src/lib/types';

const INI = CARTA.inicio;
const todo: DiaComidas['hecho'] = Object.fromEntries(COMIDAS.map((c) => [c, true]));

function marcadas(desde: string, n: number, hecho: DiaComidas['hecho'] = todo): Record<string, DiaComidas> {
  return Object.fromEntries(Array.from({ length: n }, (_, i) => [sumarDias(desde, i), { hecho }]));
}

// Un peso cada 3 días bajando `kgSemana` a la semana.
function pesos(desde: string, n: number, kg: number, kgSemana: number): Mediciones['peso'] {
  return Array.from({ length: n }, (_, i) => ({ fecha: sumarDias(desde, i * 3), kg: kg + (kgSemana * i * 3) / 7 }));
}

describe('tendencia', () => {
  it('saca los kg por semana de los pesos sueltos', () => {
    expect(tendencia(pesos(INI, 6, 80, -0.5).map((e) => ({ fecha: e.fecha, v: e.kg })))).toBeCloseTo(-0.5, 5);
  });

  it('con pocos datos o pocos días no dice nada', () => {
    expect(tendencia(pesos(INI, 3, 80, -0.5).map((e) => ({ fecha: e.fecha, v: e.kg })))).toBeNull();
    const juntos = [0, 1, 2, 3].map((i) => ({ fecha: sumarDias(INI, i), v: 80 }));
    expect(tendencia(juntos)).toBeNull();
  });
});

describe('semanas de dieta y peso', () => {
  it('cuenta las comidas marcadas y las kcal de lo marcado más los extras', () => {
    const comidas = marcadas(INI, 7);
    comidas[INI] = { hecho: { desayuno: true }, snack: [{ t: 'Barrita', kcal: 200, p: 20 }] };
    const [s] = semanasPD('yasmina', { peso: [], cintura: [] }, comidas, sumarDias(INI, 7 + 6), 2).slice(1);
    expect(s.lunes).toBe(INI);
    expect(s.cumple).toBeCloseTo((1 + 6 * 4) / 28, 5);
    const plan = (i: number) => planDia('yasmina', diaCiclo(sumarDias(INI, i)));
    const kcal = plan(0)[0].kcal + 200 + [1, 2, 3, 4, 5, 6].reduce((a, i) => a + plan(i).reduce((b, r) => b + r.kcal, 0), 0);
    expect(s.kcal).toBeCloseTo(kcal / 7, 5);
  });

  it('hoy solo cuenta si ya hay algo marcado y lo de antes del inicio no cuenta', () => {
    const hoy = sumarDias(INI, 2);
    const [s] = semanasPD('jose', { peso: [], cintura: [] }, marcadas(INI, 2), hoy, 1);
    expect(s.cumple).toBe(1);
    const [antes] = semanasPD('jose', { peso: [], cintura: [] }, {}, sumarDias(INI, -3), 1);
    expect(antes.cumple).toBeNull();
  });

  it('peso y cintura son la media de la semana', () => {
    const med = { peso: [{ fecha: INI, kg: 80 }, { fecha: sumarDias(INI, 3), kg: 79 }], cintura: [{ fecha: INI, cm: 90 }] };
    const [s] = semanasPD('yasmina', med, {}, sumarDias(INI, 6), 1);
    expect([s.peso, s.cintura]).toEqual([79.5, 90]);
  });
});

describe('veredicto', () => {
  const hoy = sumarDias(INI, 20);
  const vacia = { peso: [], cintura: [] };

  it('antes de dos semanas de dieta espera', () => {
    const v = veredicto('yasmina', vacia, {}, sumarDias(INI, 10));
    expect([v.tipo, v.faltan]).toEqual(['pronto', 4]);
  });

  it('si no se cumple la dieta, lo primero es cumplirla', () => {
    const v = veredicto('yasmina', { peso: pesos(INI, 7, 80, 0), cintura: [] }, marcadas(INI, 21, { comida: true, cena: true }), hoy);
    expect(v.tipo).toBe('cumplir');
    expect(v.cumple).toBeCloseTo(0.5, 5);
  });

  it('cumpliendo, el ritmo decide: lento, a ritmo o demasiado rápido', () => {
    const c = marcadas(INI, 21);
    expect(veredicto('yasmina', { peso: pesos(INI, 7, 80, -0.1), cintura: [] }, c, hoy).tipo).toBe('lento');
    expect(veredicto('yasmina', { peso: pesos(INI, 7, 80, -0.6), cintura: [] }, c, hoy).tipo).toBe('ritmo');
    expect(veredicto('yasmina', { peso: pesos(INI, 7, 80, -1.3), cintura: [] }, c, hoy).tipo).toBe('rapido');
    expect(veredicto('jose', { peso: pesos(INI, 7, 72, 0), cintura: [] }, c, hoy).tipo).toBe('ritmo');
  });

  it('si el peso no baja pero la cintura sí, va bien', () => {
    const cintura = pesos(INI, 7, 90, -0.5).map((e) => ({ fecha: e.fecha, cm: e.kg }));
    expect(veredicto('yasmina', { peso: pesos(INI, 7, 80, 0), cintura }, marcadas(INI, 21), hoy).tipo).toBe('cintura');
  });

  it('cumpliendo pero sin pesarse no puede decir el ritmo', () => {
    expect(veredicto('jose', vacia, marcadas(INI, 21), hoy).tipo).toBe('pronto');
  });
});
