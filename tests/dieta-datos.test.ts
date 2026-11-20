import { describe, expect, it } from 'vitest';
import { PRODUCTOS, diaCiclo, planDia } from '../src/lib/casa';
import { diasDieta, fueraDeLista, macrosRacion } from '../src/lib/dieta-datos';
import type { DiaComidas } from '../src/lib/comidas';

describe('macrosRacion', () => {
  it('kcal, proteína, hidratos y grasa de una comida del plan, sumando sus ingredientes', () => {
    const r = planDia('jose', diaCiclo('2026-11-16'))[0];
    const m = macrosRacion(r);
    const suma = (k: 'kcal' | 'prot' | 'hc' | 'grasa') => r.lineas.reduce((n, l) => n + (PRODUCTOS[l.id].por100[k] * l.g) / 100, 0);
    expect(m.kcal).toBeCloseTo(suma('kcal'), 5);
    expect(m.p).toBeCloseTo(suma('prot'), 5);
    expect(m.hc).toBeCloseTo(suma('hc'), 5);
    expect(m.grasa).toBeCloseTo(suma('grasa'), 5);
  });
});

describe('diasDieta', () => {
  const comidas: Record<string, DiaComidas> = {
    '2026-11-16': {
      hecho: { desayuno: true, merienda: true },
      snack: [
        { t: 'Barrita de proteína', kcal: 200, p: 20 },
        { t: 'Pasta', kcal: 225, p: 7, hc: 45, grasa: 1 },
      ],
    },
    '2026-11-17': { hecho: { desayuno: true } },
    '2026-11-10': { compra: ['A:aguacate'] },
    '2026-11-11': { hecho: {} },
  };

  it('un día por fecha con algo comido, en orden, con lo del plan y lo de fuera por separado', () => {
    const dias = diasDieta(comidas);
    expect(dias.map((d) => d.fecha)).toEqual(['2026-11-16', '2026-11-17']);
    const d = dias[0];
    const plan = planDia('jose', diaCiclo('2026-11-16'));
    const desayuno = macrosRacion(plan.find((r) => r.comida === 'desayuno')!);
    const merienda = macrosRacion(plan.find((r) => r.comida === 'merienda')!);
    expect(d.hechas).toEqual(['desayuno', 'merienda']);
    expect(d.plan.kcal).toBeCloseTo(desayuno.kcal + merienda.kcal, 5);
    expect(d.fuera).toEqual({ kcal: 425, p: 27, hc: 45, grasa: 1 });
    expect(d.total.kcal).toBeCloseTo(d.plan.kcal + 425, 5);
    expect(d.sinMacros).toBe(1);
  });

  it('se puede acotar por fechas', () => {
    expect(diasDieta(comidas, '2026-11-15', '2026-11-16').map((d) => d.fecha)).toEqual(['2026-11-16']);
  });
});

describe('fueraDeLista', () => {
  it('lo de fuera agrupado por nombre (sin mayúsculas ni tildes), lo que más kcal suma primero', () => {
    const f = fueraDeLista({
      '2026-11-16': { snack: [{ t: 'Polvorón', kcal: 160, p: 1 }, { t: 'Barrita de proteína', kcal: 200, p: 20 }] },
      '2026-11-17': { snack: [{ t: 'polvoron', kcal: 160, p: 1 }, { t: 'Creatina 5 g', kcal: 0, p: 0 }] },
    });
    expect(f).toEqual([
      { nombre: 'Polvorón', veces: 2, kcal: 320, p: 2 },
      { nombre: 'Barrita de proteína', veces: 1, kcal: 200, p: 20 },
      { nombre: 'Creatina 5 g', veces: 1, kcal: 0, p: 0 },
    ]);
  });
});
