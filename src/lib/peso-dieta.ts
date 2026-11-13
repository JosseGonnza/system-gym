import { CARTA, diaCiclo, lunesDe, planDia, sumarDias, type Persona } from './casa';
import type { DiaComidas } from './comidas';
import type { Mediciones } from './types';

export interface SemanaPD {
  lunes: string;
  peso: number | null;
  cintura: number | null;
  cumple: number | null;
  kcal: number | null;
}

export type TipoVeredicto = 'pronto' | 'cumplir' | 'rapido' | 'lento' | 'cintura' | 'ritmo';

export interface Veredicto {
  tipo: TipoVeredicto;
  ritmo: number | null;
  cumple: number | null;
  faltan: number;
}

export const DIAS_VEREDICTO = 14;
const VENTANA = 21;
export const CUMPLE_MIN = 0.8;
export const AJUSTE_KCAL = 150;

const dias = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00`) - Date.parse(`${a}T12:00:00`)) / 86_400_000);
const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

// Hoy cuenta solo si ya hay algo marcado: a media mañana no es un día incumplido.
function diasContados(comidas: Record<string, DiaComidas>, desde: string, hoy: string): string[] {
  const out: string[] = [];
  for (let f = desde < CARTA.inicio ? CARTA.inicio : desde; f <= hoy; f = sumarDias(f, 1)) {
    if (f < hoy || comidas[f]?.hecho) out.push(f);
  }
  return out;
}

function cumplimiento(p: Persona, comidas: Record<string, DiaComidas>, fechas: string[]): { cumple: number | null; kcal: number | null } {
  if (!fechas.length) return { cumple: null, kcal: null };
  let hechas = 0;
  let total = 0;
  let kcal = 0;
  for (const f of fechas) {
    const plan = planDia(p, diaCiclo(f));
    const d = comidas[f];
    total += plan.length;
    for (const r of plan) {
      if (!d?.hecho?.[r.comida]) continue;
      hechas++;
      kcal += r.kcal;
    }
    kcal += (d?.snack ?? []).reduce((a, x) => a + (x.kcal ?? 0), 0);
  }
  return { cumple: hechas / total, kcal: kcal / fechas.length };
}

// Pendiente por mínimos cuadrados, en unidades por semana. Con menos de 4
// datos o menos de 10 días entre el primero y el último no dice nada.
export function tendencia(puntos: { fecha: string; v: number }[]): number | null {
  if (puntos.length < 4) return null;
  const x0 = puntos[0].fecha;
  const xs = puntos.map((q) => dias(x0, q.fecha));
  if (Math.max(...xs) - Math.min(...xs) < 10) return null;
  const mx = media(xs)!;
  const my = media(puntos.map((q) => q.v))!;
  let num = 0;
  let den = 0;
  puntos.forEach((q, i) => {
    num += (xs[i] - mx) * (q.v - my);
    den += (xs[i] - mx) ** 2;
  });
  return den ? (num / den) * 7 : null;
}

export function semanasPD(p: Persona, med: Mediciones, comidas: Record<string, DiaComidas>, hoy: string, n = 6): SemanaPD[] {
  const out: SemanaPD[] = [];
  for (let w = 0; w < n; w++) {
    const lunes = sumarDias(lunesDe(hoy), -7 * w);
    const dom = sumarDias(lunes, 6);
    const dentro = (f: string) => f >= lunes && f <= dom;
    const fechas = lunes > hoy ? [] : diasContados(comidas, lunes, dom < hoy ? dom : hoy);
    out.push({
      lunes,
      peso: media(med.peso.filter((e) => dentro(e.fecha)).map((e) => e.kg)),
      cintura: media(med.cintura.filter((e) => dentro(e.fecha)).map((e) => e.cm)),
      ...cumplimiento(p, comidas, fechas),
    });
  }
  return out;
}

export function veredicto(p: Persona, med: Mediciones, comidas: Record<string, DiaComidas>, hoy: string): Veredicto {
  const desde = sumarDias(hoy, -VENTANA);
  const ini = desde > CARTA.inicio ? desde : CARTA.inicio;
  const serie = <T extends { fecha: string }>(xs: T[], v: (e: T) => number) =>
    xs.filter((e) => e.fecha >= ini && e.fecha <= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha)).map((e) => ({ fecha: e.fecha, v: v(e) }));
  const ritmo = tendencia(serie(med.peso, (e) => e.kg));
  const { cumple } = cumplimiento(p, comidas, diasContados(comidas, sumarDias(hoy, -(DIAS_VEREDICTO - 1)), hoy));
  const faltan = Math.max(0, DIAS_VEREDICTO - dias(CARTA.inicio, hoy));
  const r = (tipo: TipoVeredicto): Veredicto => ({ tipo, ritmo, cumple, faltan });

  if (faltan) return r('pronto');
  if (cumple == null || cumple < CUMPLE_MIN) return r('cumplir');
  if (ritmo == null) return r('pronto');
  const [rapido, lento] = CARTA.personas[p].ritmo;
  if (ritmo < rapido - 0.25) return r('rapido');
  if (ritmo > lento) {
    const cintura = tendencia(serie(med.cintura, (e) => e.cm));
    return r(cintura != null && cintura <= -0.3 ? 'cintura' : 'lento');
  }
  return r('ritmo');
}
