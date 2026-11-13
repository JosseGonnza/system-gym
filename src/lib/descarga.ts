import { mejorSerie } from './fuerza';
import { sumarDias } from './plan-jeik';
import type { Sesion } from './types';

export type Senal = 'cansancio' | 'estancado' | 'fallos';

export interface Descarga {
  toca: boolean;
  senales: Senal[];
  energia: [number, number] | null;
  sueno: [number, number] | null;
  baja: { energia: boolean; sueno: boolean };
  estancados: string[];
  fallos: [number, number] | null;
}

// Reciente: últimos 14 días. Base: de 14 a 70 días atrás.
const RECIENTE = 14;
const BASE = 70;
const BAJA_ENERGIA = 0.4;
const BAJA_SUENO = 0.75;
const SUBEN_FALLOS = 0.08;
const FALLOS_MIN = 0.15;
const ESTANCADOS_MIN = 3;
const ESTANCADOS_PCT = 0.4;
export const SENALES_MIN = 2;

const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

function par(rec: Sesion[], base: Sesion[], v: (s: Sesion) => number | null | undefined, minRec = 3, minBase = 6): [number, number] | null {
  const r = rec.map(v).filter((x): x is number => x != null);
  const b = base.map(v).filter((x): x is number => x != null);
  if (r.length < minRec || b.length < minBase) return null;
  return [media(r)!, media(b)!];
}

function tasaFallos(ss: Sesion[]): number | null {
  const series = ss.flatMap((s) => s.ejercicios.flatMap((e) => e.series)).filter((x) => x.estado !== 'pendiente' && x.reps != null);
  if (series.length < 20) return null;
  return series.filter((x) => x.estado === 'fallo' || x.estado === 'corta').length / series.length;
}

// Estancado: las 3 últimas sesiones del ejercicio no superan el 1RM estimado
// de las 3 anteriores. Solo cuenta lo que se ha hecho en las últimas 4 semanas.
function estancados(ses: Sesion[], hoy: string): { ids: string[]; total: number } {
  const por = new Map<string, { fecha: string; v: number; nombre: string }[]>();
  for (const s of ses) {
    for (const e of s.ejercicios) {
      const m = mejorSerie(e.series);
      if (m) por.set(e.ranuraId, [...(por.get(e.ranuraId) ?? []), { fecha: s.fecha, v: m.e1rm, nombre: e.nombre }]);
    }
  }
  const ids: string[] = [];
  let total = 0;
  for (const xs of por.values()) {
    if (xs.length < 6 || xs[xs.length - 1].fecha < sumarDias(hoy, -28)) continue;
    total++;
    const top = (ys: typeof xs) => Math.max(...ys.map((y) => y.v));
    if (top(xs.slice(-3)) <= top(xs.slice(-6, -3)) + 0.01) ids.push(xs[xs.length - 1].nombre);
  }
  return { ids, total };
}

export function descarga(sesiones: Sesion[], hoy: string): Descarga {
  const ses = sesiones.filter((s) => s.estado === 'finalizada' && s.fecha <= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const corte = sumarDias(hoy, -RECIENTE + 1);
  const rec = ses.filter((s) => s.fecha >= corte);
  const base = ses.filter((s) => s.fecha < corte && s.fecha >= sumarDias(hoy, -BASE + 1));

  const energia = par(rec, base, (s) => s.energia);
  const sueno = par(rec, base, (s) => s.suenoH);
  const fr = tasaFallos(rec);
  const fb = tasaFallos(base);
  const fallos: [number, number] | null = fr != null && fb != null ? [fr, fb] : null;
  const est = estancados(ses, hoy);

  const senales: Senal[] = [];
  const baja = { energia: !!energia && energia[0] <= energia[1] - BAJA_ENERGIA, sueno: !!sueno && sueno[0] <= sueno[1] - BAJA_SUENO };
  if (baja.energia || baja.sueno) senales.push('cansancio');
  if (est.ids.length >= ESTANCADOS_MIN && est.ids.length >= est.total * ESTANCADOS_PCT) senales.push('estancado');
  if (fallos && fallos[0] >= FALLOS_MIN && fallos[0] >= fallos[1] + SUBEN_FALLOS) senales.push('fallos');

  return { toca: senales.length >= SENALES_MIN, senales, energia, sueno, baja, estancados: est.ids, fallos };
}
