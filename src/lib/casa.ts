// Dieta de casa (Jose y Yasmina): los dos comen los mismos platos de la carta,
// cada uno con su ración. Jose come el plato tal cual está escrito; a Yasmina
// se le escala con dos factores para que cada comida llegue a su hueco.
import productosJson from '../data/casa/productos.json';
import cartaJson from '../data/casa/carta.json';
export { lunesDe, sumarDias } from './plan-jeik';

export type Comida = 'desayuno' | 'comida' | 'merienda' | 'cena';
export type Persona = 'jose' | 'yasmina';
export type Semana = 'A' | 'B';

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  envase: string;
  util_g: number;
  por100: { kcal: number; prot: number; hc: number; grasa: number };
  unidad?: { g: number; uds: [string, string] };
  prot?: boolean;
  fresco?: boolean;
  aparte?: boolean;
  cocido?: number;
  estado?: string;
}

export interface Cant {
  g?: number;
  u?: number;
}

export interface Plato {
  id: string;
  comida: Comida;
  nombre: string;
  corto: string;
  ing: [string, Cant][];
  curro?: boolean;
  reparto?: boolean;
  una?: boolean;
  partes?: { nombre: string; ids: string[] }[];
}

export interface Atajo {
  t: string;
  kcal: number;
  p: number;
  hc?: number;
  grasa?: number;
}

export interface PersonaDef {
  nombre: string;
  kcal: number;
  prot: number;
  comidas: Record<Comida, [number, number]>;
  escala: boolean;
  nota: string;
  // kg por semana que se dan por buenos: [más rápido, más lento].
  ritmo: [number, number];
  evita?: string[];
  atajos?: Atajo[];
}

interface Carta {
  inicio: string;
  comidas: Record<Comida, string>;
  fruta: Record<Semana, { producto: string; u: number }>;
  personas: Record<Persona, PersonaDef>;
  atajos: Atajo[];
  platos: Plato[];
  ciclo: ({ dia: string } & Record<Comida, string>)[];
  ciclo_yasmina: Record<string, Partial<Record<Comida, string>>>;
}

export interface Linea {
  id: string;
  g: number;
  u?: number;
}

export interface Racion {
  plato: Plato;
  comida: Comida;
  lineas: Linea[];
  kcal: number;
  prot: number;
  eur: number;
}

export const CARTA = cartaJson as unknown as Carta;

export const atajosDe = (p: Persona): Atajo[] => CARTA.personas[p].atajos ?? CARTA.atajos;
export const PRODUCTOS: Record<string, Producto> = Object.fromEntries((productosJson as unknown as Producto[]).map((p) => [p.id, p]));
export const PLATOS: Record<string, Plato> = Object.fromEntries(CARTA.platos.map((p) => [p.id, p]));
export const COMIDAS: Comida[] = ['desayuno', 'comida', 'merienda', 'cena'];
export const PERSONAS: Persona[] = ['jose', 'yasmina'];
export const DIAS_CICLO = CARTA.ciclo.length;
const FRUTAS = new Set(Object.values(CARTA.fruta).map((f) => f.producto));

const DIA_MS = 86_400_000;
const aFecha = (iso: string) => new Date(`${iso}T12:00:00`);

// El ciclo arranca en una fecha fija del código, no de cada móvil: así los dos
// ven el mismo día. Antes del inicio también cuenta, hacia atrás.
export function diaCiclo(iso: string): number {
  const dias = Math.round((aFecha(iso).getTime() - aFecha(CARTA.inicio).getTime()) / DIA_MS);
  return ((dias % DIAS_CICLO) + DIAS_CICLO) % DIAS_CICLO;
}

export const semanaDe = (idx: number): Semana => (idx < 7 ? 'A' : 'B');

export function platoDe(p: Persona, idx: number, c: Comida): Plato {
  const d = CARTA.ciclo[idx];
  const id = (p === 'yasmina' && CARTA.ciclo_yasmina[d.dia]?.[c]) || d[c];
  return PLATOS[id];
}

function resolver(id: string, q: Cant, sem: Semana): [string, Cant] {
  if (id !== 'fruta') return [id, q];
  const f = CARTA.fruta[sem];
  return [f.producto, { u: (q.u ?? 1) * f.u }];
}

const gramosDe = (id: string, q: Cant): number => q.g ?? (q.u ?? 0) * (PRODUCTOS[id].unidad?.g ?? 0);

export function totales(lineas: Linea[]): { kcal: number; prot: number; eur: number } {
  let kcal = 0;
  let prot = 0;
  let eur = 0;
  for (const l of lineas) {
    const p = PRODUCTOS[l.id];
    kcal += (p.por100.kcal * l.g) / 100;
    prot += (p.por100.prot * l.g) / 100;
    eur += (l.g * p.precio) / p.util_g;
  }
  return { kcal, prot, eur };
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const a005 = (n: number) => Math.round(n / 0.05) * 0.05;

// Grupo A: lo que lleva la proteína (o la parte del plato que tiene la carne);
// grupo B: el resto. Se busca el par de factores que clava kcal y proteína, con
// topes para que ninguna ración quede ridícula, y luego se reajusta B para las
// kcal. Una olla que se cocina para los dos (una) lleva un solo factor.
function grupoA(pl: Plato): (id: string) => boolean {
  if (pl.partes) {
    const conProt = pl.partes.find((pt) => pt.ids.some((id) => PRODUCTOS[id]?.prot)) ?? pl.partes[0];
    const ids = new Set(conProt.ids);
    return (id) => ids.has(id);
  }
  return (id) => !!PRODUCTOS[id]?.prot;
}

export function escalar(pl: Plato, sem: Semana, obj: [number, number] | null): { lineas: Linea[]; f: [number, number] } {
  const L = pl.ing.map(([id, q]) => resolver(id, q, sem));
  let fa = 1;
  let fb = 1;
  if (obj) {
    const [k, p] = obj;
    const enA = grupoA(pl);
    const lin = L.map(([id, q]) => ({ id, g: gramosDe(id, q) }));
    const A = totales(lin.filter((l) => enA(l.id)));
    const B = totales(lin.filter((l) => !enA(l.id)));
    const K = A.kcal + B.kcal;
    if (pl.una || !A.kcal || !B.kcal) {
      fa = fb = k / K;
    } else {
      const det = A.kcal * B.prot - B.kcal * A.prot;
      [fa, fb] = Math.abs(det) > 1e-6 ? [(k * B.prot - B.kcal * p) / det, (A.kcal * p - k * A.prot) / det] : [k / K, k / K];
      fa = clamp(fa, 0.55, 1);
      fb = clamp((k - fa * A.kcal) / B.kcal, 0.35, 1);
    }
    if (pl.una) fa = fb = clamp(fa, 0.35, 1);
    fa = a005(fa);
    fb = a005(fb);
  }
  const enA = grupoA(pl);
  const lineas = L.map(([id, q]): Linea => {
    const f = enA(id) ? fa : fb;
    if (q.u !== undefined) {
      const u = FRUTAS.has(id) && f < 1 ? Math.max(0.5, Math.round(q.u * f * 2) / 2) : q.u >= 1 ? Math.max(1, Math.round(q.u * f)) : q.u;
      return { id, u, g: u * (PRODUCTOS[id].unidad?.g ?? 0) };
    }
    return { id, g: Math.round(((q.g ?? 0) * f) / 5) * 5 };
  });
  return { lineas, f: [fa, fb] };
}

// El escalado se pasa de kcal por los redondeos y los topes. Se corrige solo:
// se bajan los huecos de kcal en proporción hasta que la media del ciclo cae en
// el objetivo. La proteína de cada hueco no se toca.
const huecos = new Map<Persona, Record<Comida, [number, number]>>();

function huecosDe(p: Persona): Record<Comida, [number, number]> | null {
  const def = CARTA.personas[p];
  if (!def.escala) return null;
  const hecho = huecos.get(p);
  if (hecho) return hecho;
  let h = { ...def.comidas };
  for (let i = 0; i < 6; i++) {
    let suma = 0;
    for (let d = 0; d < DIAS_CICLO; d++) {
      for (const c of COMIDAS) {
        const pl = platoDe(p, d, c);
        suma += totales(escalar(pl, semanaDe(d), h[c]).lineas).kcal;
      }
    }
    const ajuste = def.kcal / (suma / DIAS_CICLO);
    if (Math.abs(ajuste - 1) < 0.005) break;
    h = Object.fromEntries(COMIDAS.map((c) => [c, [h[c][0] * ajuste, h[c][1]]])) as Record<Comida, [number, number]>;
  }
  huecos.set(p, h);
  return h;
}

export function racion(p: Persona, idx: number, c: Comida): Racion {
  const pl = platoDe(p, idx, c);
  const h = huecosDe(p);
  const { lineas } = escalar(pl, semanaDe(idx), h ? h[c] : null);
  const t = totales(lineas);
  return { plato: pl, comida: c, lineas, kcal: t.kcal, prot: t.prot, eur: pl.curro ? 0 : t.eur };
}

export const planDia = (p: Persona, idx: number): Racion[] => COMIDAS.map((c) => racion(p, idx, c));

// Peso del plato hecho (estimado con la merma o lo que crece cada cosa) y qué
// porcentaje se lleva cada uno. Pan, fruta y lo que va aparte no cuenta.
export interface Reparto {
  nombre: string;
  total: number;
  jose: number;
  yasmina: number;
  pctJose: number;
}

const pesoCocido = (lineas: Linea[]) =>
  lineas.reduce((a, l) => (PRODUCTOS[l.id].aparte ? a : a + l.g * (PRODUCTOS[l.id].cocido ?? 1)), 0);

export function reparto(pl: Plato, jose: Racion, yasmina: Racion): Reparto[] {
  const partes = pl.partes ?? [{ nombre: 'Plato terminado', ids: pl.ing.map(([id]) => id) }];
  return partes.map((pt) => {
    const ids = new Set(pt.ids.flatMap((id) => (id === 'fruta' ? [...FRUTAS] : [id])));
    const j = pesoCocido(jose.lineas.filter((l) => ids.has(l.id)));
    const y = pesoCocido(yasmina.lineas.filter((l) => ids.has(l.id)));
    const pctJose = Math.round((j / (j + y)) * 100);
    return { nombre: pt.nombre, total: j + y, jose: j, yasmina: y, pctJose };
  });
}

// Gramos que se comen en cada semana del ciclo (los dos juntos) y por persona
// en el ciclo entero. Lo del curro no entra: no se compra.
export function consumo(): { semana: Record<Semana, Record<string, number>>; persona: Record<Persona, Record<string, number>> } {
  const semana: Record<Semana, Record<string, number>> = { A: {}, B: {} };
  const persona: Record<Persona, Record<string, number>> = { jose: {}, yasmina: {} };
  for (const p of PERSONAS) {
    for (let d = 0; d < DIAS_CICLO; d++) {
      for (const r of planDia(p, d)) {
        if (r.plato.curro) continue;
        for (const l of r.lineas) {
          const s = semana[semanaDe(d)];
          s[l.id] = (s[l.id] ?? 0) + l.g;
          persona[p][l.id] = (persona[p][l.id] ?? 0) + l.g;
        }
      }
    }
  }
  return { semana, persona };
}

export interface ItemPedido {
  id: string;
  n: number;
  usa: number;
  eur: number;
}

// Cada semana trae sus frescos; la despensa del ciclo entero se reparte entre
// los dos pedidos para que cuesten parecido. Se compran envases enteros: si se
// gasta poco más de uno (hasta un 12 %), se pide uno.
export function pedidos(): Record<Semana, ItemPedido[]> {
  const { semana } = consumo();
  const ids = [...new Set([...Object.keys(semana.A), ...Object.keys(semana.B)])].sort();
  const item = (id: string, g: number): ItemPedido => {
    const p = PRODUCTOS[id];
    const usa = g / p.util_g;
    const n = Math.max(1, Math.ceil(usa - 0.12));
    return { id, n, usa, eur: n * p.precio };
  };
  const out: Record<Semana, ItemPedido[]> = { A: [], B: [] };
  for (const id of ids) {
    if (PRODUCTOS[id].fresco) {
      for (const s of ['A', 'B'] as Semana[]) if (semana[s][id]) out[s].push(item(id, semana[s][id]));
    } else {
      // Las dos semanas de golpe, en el pedido de la primera que lo usa: repartirlo
      // por precio dejaba el atún en el B cuando la A ya lo pedía.
      out[semana.A[id] ? 'A' : 'B'].push(item(id, (semana.A[id] ?? 0) + (semana.B[id] ?? 0)));
    }
  }
  return out;
}

// Lo que cuesta lo que se come cada uno, a precio de envase: €/semana.
export function costeSemana(): Record<Persona, number> {
  const { persona } = consumo();
  const coste = (m: Record<string, number>) => Object.entries(m).reduce((a, [id, g]) => a + (g * PRODUCTOS[id].precio) / PRODUCTOS[id].util_g, 0);
  return { jose: coste(persona.jose) / 2, yasmina: coste(persona.yasmina) / 2 };
}

export const alMes = (semana: number): number => (semana * 365) / 12 / 7;

export function cantidad(l: Linea): string {
  if (l.u === undefined) return `${Math.round(l.g).toLocaleString('es-ES')} g`;
  const u = l.u;
  const n = u === 0.5 ? '½' : u % 1 ? `${Math.floor(u)}½` : String(u);
  const uds = PRODUCTOS[l.id].unidad?.uds ?? ['ud', 'uds'];
  return `${n} ${uds[u > 1 ? 1 : 0]}`;
}
