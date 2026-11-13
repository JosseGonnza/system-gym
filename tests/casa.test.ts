import { describe, expect, it } from 'vitest';
import {
  CARTA,
  COMIDAS,
  DIAS_CICLO,
  PLATOS,
  PRODUCTOS,
  alMes,
  cantidad,
  consumo,
  costeSemana,
  diaCiclo,
  escalar,
  lunesDe,
  pedidos,
  planDia,
  platoDe,
  racion,
  reparto,
  semanaDe,
} from '../src/lib/casa';

const dia = (p: 'jose' | 'yasmina', d: number) => planDia(p, d).reduce((a, r) => ({ kcal: a.kcal + r.kcal, prot: a.prot + r.prot }), { kcal: 0, prot: 0 });
const media = (p: 'jose' | 'yasmina') => {
  let k = 0;
  let pr = 0;
  for (let d = 0; d < DIAS_CICLO; d++) {
    const t = dia(p, d);
    k += t.kcal;
    pr += t.prot;
  }
  return { kcal: k / DIAS_CICLO, prot: pr / DIAS_CICLO };
};

describe('datos de la carta', () => {
  it('cada ingrediente de cada plato existe en productos', () => {
    for (const pl of CARTA.platos) for (const [id] of pl.ing) if (id !== 'fruta') expect(PRODUCTOS[id], `${pl.id}: ${id}`).toBeDefined();
  });

  it('cada día del ciclo apunta a platos de su comida, también los cambios de Yasmina', () => {
    for (let d = 0; d < DIAS_CICLO; d++)
      for (const p of ['jose', 'yasmina'] as const)
        for (const c of COMIDAS) expect(platoDe(p, d, c).comida, `${p} ${d} ${c}`).toBe(c);
  });

  it('Yasmina nunca tiene curro y no hay manzana ni pimiento en la carta', () => {
    for (let d = 0; d < DIAS_CICLO; d++) for (const c of COMIDAS) expect(platoDe('yasmina', d, c).curro).toBeFalsy();
    const ids = CARTA.platos.flatMap((p) => p.ing.map(([id]) => id));
    expect(ids).not.toContain('manzana');
    expect(ids).not.toContain('pimientos');
  });

  it('los huecos de Yasmina suman su objetivo', () => {
    {
      const def = CARTA.personas.yasmina;
      expect(COMIDAS.reduce((a, c) => a + def.comidas[c][0], 0)).toBe(def.kcal);
      expect(COMIDAS.reduce((a, c) => a + def.comidas[c][1], 0)).toBe(def.prot);
    }
  });
});

describe('calendario', () => {
  it('el ciclo empieza el lunes de inicio y da la vuelta a los 14 días', () => {
    expect(diaCiclo(CARTA.inicio)).toBe(0);
    expect(diaCiclo('2026-11-22')).toBe(6);
    expect(diaCiclo('2026-11-23')).toBe(7);
    expect(diaCiclo('2026-11-30')).toBe(0);
    expect(diaCiclo('2026-11-15')).toBe(13);
  });

  it('la primera semana es la A y la segunda la B', () => {
    expect(semanaDe(0)).toBe('A');
    expect(semanaDe(6)).toBe('A');
    expect(semanaDe(7)).toBe('B');
  });

  it('lunesDe da el lunes de esa semana', () => {
    expect(lunesDe('2026-11-16')).toBe('2026-11-16');
    expect(lunesDe('2026-11-22')).toBe('2026-11-16');
    expect(lunesDe('2026-11-19')).toBe('2026-11-16');
  });
});

describe('raciones', () => {
  it('Jose come el plato tal cual está escrito', () => {
    const r = racion('jose', 0, 'comida');
    expect(r.plato.id).toBe('c1');
    expect(r.lineas.find((l) => l.id === 'pollo')?.g).toBe(200);
    expect(r.lineas.find((l) => l.id === 'arroz')?.g).toBe(100);
  });

  it('Jose ronda sus 2.500 kcal y pasa de 150 g de proteína de media', () => {
    const m = media('jose');
    expect(m.kcal).toBeGreaterThan(2300);
    expect(m.kcal).toBeLessThan(2550);
    expect(m.prot).toBeGreaterThanOrEqual(150);
  });

  it('a Yasmina el ciclo le sale en su objetivo de media, sin días disparados', () => {
    const m = media('yasmina');
    expect(Math.abs(m.kcal - 1700)).toBeLessThan(40);
    expect(m.prot).toBeGreaterThan(115);
    for (let d = 0; d < DIAS_CICLO; d++) expect(dia('yasmina', d).kcal, `día ${d}`).toBeLessThan(1950);
  });

  it('su ración nunca es mayor que la de Jose en el mismo plato', () => {
    for (let d = 0; d < DIAS_CICLO; d++)
      for (const c of COMIDAS) {
        const j = racion('jose', d, c);
        const y = racion('yasmina', d, c);
        if (j.plato.id !== y.plato.id) continue;
        for (const l of y.lineas) expect(l.g, `${j.plato.id} ${l.id}`).toBeLessThanOrEqual(j.lineas.find((x) => x.id === l.id)!.g);
      }
  });

  it('la olla de legumbre baja todo en la misma proporción', () => {
    const { lineas, f } = escalar(PLATOS.c4, 'A', [480, 30]);
    expect(f[0]).toBe(f[1]);
    expect(lineas.find((l) => l.id === 'lenteja')!.g).toBe(Math.round((400 * f[0]) / 5) * 5);
  });

  it('la salsa boloñesa lleva un solo factor y la pasta otro', () => {
    const { lineas, f } = escalar(PLATOS.c3, 'A', [550, 35]);
    const g = (id: string) => lineas.find((l) => l.id === id)!.g;
    expect(g('carne-picada')).toBe(Math.round((150 * f[0]) / 5) * 5);
    expect(g('tomate-frito')).toBe(Math.round((100 * f[0]) / 5) * 5);
    expect(g('macarron')).toBe(Math.round((100 * f[1]) / 5) * 5);
  });

  it('la fruta es la de la semana y se redondea a medias piezas', () => {
    const a = escalar(PLATOS.c1, 'A', null).lineas.find((l) => l.id === 'banana');
    const b = escalar(PLATOS.c1, 'B', [400, 30]).lineas.find((l) => l.id === 'kiwi');
    expect(a?.u).toBe(1);
    expect(b).toBeDefined();
    expect((b!.u! * 2) % 1).toBe(0);
  });

  it('lo del curro cuenta kcal pero no cuesta', () => {
    const r = racion('jose', 5, 'desayuno');
    expect(r.plato.curro).toBe(true);
    expect(r.kcal).toBeGreaterThan(0);
    expect(r.eur).toBe(0);
  });

  it('escribe las cantidades por unidades o por gramos', () => {
    expect(cantidad({ id: 'huevo', u: 3, g: 153 })).toBe('3 huevos');
    expect(cantidad({ id: 'banana', u: 0.5, g: 60 })).toBe('½ banana');
    expect(cantidad({ id: 'kiwi', u: 1.5, g: 135 })).toBe('1½ kiwis');
    expect(cantidad({ id: 'pollo', g: 1200 })).toBe('1200 g');
  });
});

describe('reparto del plato terminado', () => {
  const de = (id: string) => {
    for (let d = 0; d < DIAS_CICLO; d++)
      for (const c of COMIDAS) {
        const j = racion('jose', d, c);
        const y = racion('yasmina', d, c);
        if (j.plato.id === id && y.plato.id === id) return reparto(j.plato, j, y);
      }
    throw new Error(id);
  };

  it('la legumbre se reparte en un solo porcentaje, más para Jose', () => {
    const r = de('c4');
    expect(r).toHaveLength(1);
    expect(r[0].pctJose).toBeGreaterThan(55);
    expect(r[0].pctJose).toBeLessThan(75);
    expect(r[0].jose + r[0].yasmina).toBeCloseTo(r[0].total);
  });

  it('la boloñesa da dos: pasta y salsa', () => {
    const r = de('c3');
    expect(r.map((x) => x.nombre)).toEqual(['Pasta cocida', 'Salsa boloñesa']);
    expect(r[0].pctJose).toBeGreaterThan(r[1].pctJose);
  });

  it('pan, fruta y cherry no entran en el peso del plato', () => {
    const j = racion('jose', 0, 'comida');
    const sin = { ...j, lineas: j.lineas.filter((l) => !PRODUCTOS[l.id].aparte) };
    const r1 = reparto(j.plato, j, j)[0];
    const r2 = reparto(j.plato, sin, sin)[0];
    expect(r1.total).toBeCloseTo(r2.total);
    expect(r1.pctJose).toBe(50);
  });
});

describe('compra', () => {
  it('lo del curro no entra en la compra', () => {
    expect(consumo().semana.A.bacon).toBeUndefined();
  });

  it('banana solo la semana A y kiwi solo la B', () => {
    const p = pedidos();
    expect(p.A.some((x) => x.id === 'banana')).toBe(true);
    expect(p.A.some((x) => x.id === 'kiwi')).toBe(false);
    expect(p.B.some((x) => x.id === 'kiwi')).toBe(true);
  });

  it('cada fresco va en los dos pedidos y cada cosa de despensa en uno solo', () => {
    const p = pedidos();
    for (const x of [...p.A, ...p.B]) expect(x.n).toBeGreaterThanOrEqual(1);
    const desp = (l: typeof p.A) => l.filter((x) => !PRODUCTOS[x.id].fresco).map((x) => x.id);
    const a = desp(p.A);
    for (const id of desp(p.B)) expect(a).not.toContain(id);
    expect(p.A.some((x) => x.id === 'pollo') && p.B.some((x) => x.id === 'pollo')).toBe(true);
  });

  it('los dos pedidos cuestan parecido', () => {
    const p = pedidos();
    const t = (l: typeof p.A) => l.reduce((a, x) => a + x.eur, 0);
    expect(Math.abs(t(p.A) - t(p.B))).toBeLessThan(12);
  });

  it('se pide un envase de más solo si se gasta más de un 12 % por encima', () => {
    for (const x of [...pedidos().A, ...pedidos().B]) expect(x.n).toBe(Math.max(1, Math.ceil(x.usa - 0.12)));
  });

  it('el gasto de la casa ronda los 75 € a la semana', () => {
    const c = costeSemana();
    expect(c.jose).toBeGreaterThan(c.yasmina);
    expect(c.jose + c.yasmina).toBeGreaterThan(60);
    expect(c.jose + c.yasmina).toBeLessThan(85);
    expect(alMes(70)).toBeCloseTo(304.17, 1);
  });
});
