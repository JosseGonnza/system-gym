// Dieta en el centro de datos (#41, F4): lo que se come cada día apuntado, con
// las comidas del plan de casa (sus ingredientes dan kcal y macros) y lo de
// fuera de lista por separado.

import { COMIDAS, PRODUCTOS, diaCiclo, planDia, type Comida, type Racion } from './casa';
import type { DiaComidas } from './comidas';

export interface Macros {
  kcal: number;
  p: number;
  hc: number;
  grasa: number;
}
const CERO: Macros = { kcal: 0, p: 0, hc: 0, grasa: 0 };
const sumar = (a: Macros, b: Macros): Macros => ({ kcal: a.kcal + b.kcal, p: a.p + b.p, hc: a.hc + b.hc, grasa: a.grasa + b.grasa });

export function macrosRacion(r: Racion): Macros {
  return r.lineas.reduce((m, l) => {
    const x = PRODUCTOS[l.id].por100;
    return sumar(m, { kcal: (x.kcal * l.g) / 100, p: (x.prot * l.g) / 100, hc: (x.hc * l.g) / 100, grasa: (x.grasa * l.g) / 100 });
  }, CERO);
}

export interface DiaDieta {
  fecha: string;
  hechas: Comida[];
  plan: Macros;
  fuera: Macros;
  total: Macros;
  // Cosas de fuera de lista apuntadas sin hidratos o sin grasa: esos dos
  // totales se quedan cortos.
  sinMacros: number;
}

export function diasDieta(comidas: Record<string, DiaComidas>, desde = '', hasta = '9999'): DiaDieta[] {
  // Un día con solo la lista de la compra (o todo desmarcado) no es un día apuntado.
  const algo = (d: DiaComidas) => COMIDAS.some((c) => d.hecho?.[c]) || (d.snack?.length ?? 0) > 0;
  return Object.keys(comidas)
    .filter((f) => f >= desde && f <= hasta && algo(comidas[f]))
    .sort()
    .map((fecha) => {
      const d = comidas[fecha];
      const hechas = COMIDAS.filter((c) => d.hecho?.[c]);
      const raciones = planDia('jose', diaCiclo(fecha));
      const plan = hechas.reduce((m, c) => sumar(m, macrosRacion(raciones.find((r) => r.comida === c)!)), CERO);
      const snacks = d.snack ?? [];
      const fuera = snacks.reduce((m, s) => sumar(m, { kcal: s.kcal ?? 0, p: s.p ?? 0, hc: s.hc ?? 0, grasa: s.grasa ?? 0 }), CERO);
      return {
        fecha,
        hechas,
        plan,
        fuera,
        total: sumar(plan, fuera),
        sinMacros: snacks.filter((s) => (s.kcal ?? 0) > 0 && (s.hc == null || s.grasa == null)).length,
      };
    });
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function fueraDeLista(comidas: Record<string, DiaComidas>, desde = '', hasta = '9999'): { nombre: string; veces: number; kcal: number; p: number }[] {
  const por = new Map<string, { nombre: string; veces: number; kcal: number; p: number }>();
  for (const [f, d] of Object.entries(comidas)) {
    if (f < desde || f > hasta) continue;
    for (const s of d.snack ?? []) {
      const k = norm(s.t);
      const x = por.get(k) ?? { nombre: s.t, veces: 0, kcal: 0, p: 0 };
      x.veces++;
      x.kcal += s.kcal ?? 0;
      x.p += s.p ?? 0;
      por.set(k, x);
    }
  }
  return [...por.values()].sort((a, b) => b.kcal - a.kcal || b.veces - a.veces);
}
