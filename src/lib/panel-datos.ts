// Cuentas del panel del centro de datos (#41, F2-F3). Todas trabajan sobre las
// filas ya filtradas de la tabla, así el panel y la tabla dicen lo mismo.

import type { FilaSerie } from './datos';

const DIA = 86_400_000;
const r1 = (n: number) => Math.round(n * 10) / 10;
const aMs = (f: string) => Date.parse(`${f}T12:00:00Z`);
const aFecha = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const lunesDe = (f: string): string => {
  const ms = aMs(f);
  return aFecha(ms - ((new Date(ms).getUTCDay() + 6) % 7) * DIA);
};

export interface Semana {
  lunes: string;
  tonelaje: number;
  series: number;
  sesiones: number;
  dias: number;
}

// Con `desde`/`hasta` (un periodo elegido) cubre todas sus semanas, también las
// de los bordes que no tienen filas.
export function semanal(filas: FilaSerie[], desde?: string, hasta?: string): Semana[] {
  if (!filas.length && !(desde && hasta)) return [];
  const grupos = new Map<string, FilaSerie[]>();
  for (const f of filas) {
    const l = lunesDe(f.fecha);
    grupos.set(l, [...(grupos.get(l) ?? []), f]);
  }
  const lunes = [...grupos.keys(), ...(desde ? [lunesDe(desde)] : []), ...(hasta ? [lunesDe(hasta)] : [])].sort();
  const out: Semana[] = [];
  for (let ms = aMs(lunes[0]); ms <= aMs(lunes[lunes.length - 1]); ms += 7 * DIA) {
    const l = aFecha(ms);
    const xs = grupos.get(l) ?? [];
    out.push({
      lunes: l,
      tonelaje: r1(xs.reduce((n, f) => n + (f.tonelaje ?? 0), 0)),
      series: xs.length,
      sesiones: new Set(xs.map((f) => f.sesionId)).size,
      dias: new Set(xs.map((f) => f.fecha)).size,
    });
  }
  return out;
}

export interface PuntoFuerza {
  fecha: string;
  e1rm: number;
  kg: number | null;
  reps: number | null;
  record: boolean;
}

// El mejor 1RM estimado de cada sesión con ese ejercicio, y si batió lo anterior.
export function fuerzaEjercicio(filas: FilaSerie[], ejercicio: string): PuntoFuerza[] {
  const mejor = new Map<string, FilaSerie>();
  for (const f of filas) {
    if (f.ejercicio !== ejercicio || f.e1rm == null) continue;
    const prev = mejor.get(f.sesionId);
    if (!prev || f.e1rm > prev.e1rm!) mejor.set(f.sesionId, f);
  }
  let tope = -Infinity;
  return [...mejor.values()]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((f) => {
      const record = f.e1rm! > tope;
      tope = Math.max(tope, f.e1rm!);
      return { fecha: f.fecha, e1rm: f.e1rm!, kg: f.kgReal, reps: f.reps, record };
    });
}

export interface Record {
  ejercicio: string;
  kg: number;
  kgReps: number | null;
  kgFecha: string;
  e1rm: number | null;
  e1rmFecha: string | null;
  sesiones: number;
  ultima: string;
}

export function records(filas: FilaSerie[]): Record[] {
  const por = new Map<string, FilaSerie[]>();
  for (const f of filas) if (f.kgReal != null) por.set(f.ejercicio, [...(por.get(f.ejercicio) ?? []), f]);
  return [...por]
    .map(([ejercicio, xs]) => {
      const pesado = xs.reduce((a, b) => (b.kgReal! > a.kgReal! || (b.kgReal === a.kgReal && (b.reps ?? 0) > (a.reps ?? 0)) ? b : a));
      const con1rm = xs.filter((x) => x.e1rm != null);
      const fuerte = con1rm.length ? con1rm.reduce((a, b) => (b.e1rm! > a.e1rm! ? b : a)) : null;
      return {
        ejercicio,
        kg: pesado.kgReal!,
        kgReps: pesado.reps,
        kgFecha: pesado.fecha,
        e1rm: fuerte?.e1rm ?? null,
        e1rmFecha: fuerte?.fecha ?? null,
        sesiones: new Set(xs.map((x) => x.sesionId)).size,
        ultima: xs.map((x) => x.fecha).sort().pop()!,
      };
    })
    .sort((a, b) => b.ultima.localeCompare(a.ultima) || a.ejercicio.localeCompare(b.ejercicio, 'es'));
}

// Series por músculo (el principal de cada ejercicio) de media por semana en el
// periodo de las filas, contando también las semanas en que no hubo nada.
export function musculoSemanal(filas: FilaSerie[]): { musculo: string; media: number; total: number }[] {
  const validas = filas.filter((f) => f.musculo && f.musculo !== 'Cardio');
  if (!validas.length) return [];
  const fechas = validas.map((f) => f.fecha).sort();
  const semanas = Math.round((aMs(lunesDe(fechas[fechas.length - 1])) - aMs(lunesDe(fechas[0]))) / (7 * DIA)) + 1;
  const total = new Map<string, number>();
  for (const f of validas) total.set(f.musculo, (total.get(f.musculo) ?? 0) + 1);
  return [...total]
    .map(([musculo, t]) => ({ musculo, media: r1(t / semanas), total: t }))
    .sort((a, b) => b.total - a.total || a.musculo.localeCompare(b.musculo, 'es'));
}

export function porDia(filas: FilaSerie[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const f of filas) m.set(f.fecha, r1((m.get(f.fecha) ?? 0) + (f.tonelaje ?? 0)));
  return m;
}

// Media de lo medido en los 7 días que acaban en cada fecha (peso de la mañana).
export function mediaMovil(puntos: { fecha: string; v: number }[], dias = 7): { fecha: string; v: number }[] {
  const orden = [...puntos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  return orden.map((p) => {
    const desde = aMs(p.fecha) - (dias - 1) * DIA;
    const ventana = orden.filter((q) => aMs(q.fecha) >= desde && q.fecha <= p.fecha);
    return { fecha: p.fecha, v: Math.round((ventana.reduce((n, q) => n + q.v, 0) / ventana.length) * 100) / 100 };
  });
}
