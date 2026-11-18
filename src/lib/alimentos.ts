// Pesar alimentos (#42, solo Jose): eliges de la lista, pones los gramos y salen
// los macros. La lista es la compra de la Dieta de casa + lo de fuera de la carta
// + lo que Jose añade desde la app (que también puede sustituir a uno de aquí).
import { PRODUCTOS } from './casa';
import type { Pesada, Snack } from './comidas';

export interface Macros {
  kcal: number;
  prot: number;
  hc: number;
  grasa: number;
}

export interface Alimento {
  id: string;
  nombre: string;
  por100: Macros;
  estado?: string;
  // Peso hecho ÷ peso en crudo (arroz 2,7; pollo 0,75). Sin él, pesa lo mismo.
  cocido?: number;
  // Valor genérico o de memoria: cambiarlo por el de la etiqueta.
  revisar?: boolean;
  propio?: boolean;
}

export const EXTRA: Alimento[] = [
  { id: 'platano', nombre: 'Plátano', estado: 'pelado', por100: { kcal: 94, prot: 1.2, hc: 20, grasa: 0.3 } },
  { id: 'mandarina', nombre: 'Mandarina', estado: 'pelada', por100: { kcal: 40, prot: 0.8, hc: 9, grasa: 0.2 } },
  { id: 'polvoron', nombre: 'Polvorón', por100: { kcal: 530, prot: 6, hc: 56, grasa: 31 }, revisar: true },
  // Etiqueta de la Central Lechera Asturiana (Comida/huevos-lacteos). Por 100 ml: 1 ml ≈ 1 g.
  { id: 'leche-entera', nombre: 'Leche entera', por100: { kcal: 63, prot: 3.1, hc: 4.6, grasa: 3.6 } },
  // Proteína real de la analítica de Agrolab (72,6 % tal cual); kcal, hidratos y grasa sin etiqueta a mano.
  { id: 'evowhey', nombre: 'Evowhey chocolate y galletas', por100: { kcal: 385, prot: 72.6, hc: 8, grasa: 6.5 }, revisar: true },
  { id: 'yogur-proteina', nombre: 'Yogur de proteína', por100: { kcal: 60, prot: 10, hc: 4, grasa: 0.4 }, revisar: true },
  { id: 'costillas', nombre: 'Costillas de cerdo', estado: 'en crudo, sin hueso', cocido: 0.7, por100: { kcal: 277, prot: 16, hc: 0, grasa: 23.7 }, revisar: true },
  { id: 'batata', nombre: 'Batata', estado: 'en crudo', cocido: 0.8, por100: { kcal: 86, prot: 1.6, hc: 20, grasa: 0.1 } },
  { id: 'pimiento', nombre: 'Pimiento', estado: 'en crudo', cocido: 0.75, por100: { kcal: 26, prot: 1, hc: 5, grasa: 0.3 } },
  { id: 'tortilla-trigo', nombre: 'Tortilla de trigo', por100: { kcal: 300, prot: 8.5, hc: 50, grasa: 7 }, revisar: true },
  { id: 'alitas', nombre: 'Alitas de pollo empanadas', estado: 'fritas, con hueso', por100: { kcal: 220, prot: 14, hc: 8, grasa: 15 }, revisar: true },
];

const collator = new Intl.Collator('es');
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const palabras = (s: string) => norm(s).split(/[^a-z0-9ñ]+/).filter(Boolean);

const DE_LA_COMPRA: Alimento[] = Object.values(PRODUCTOS).map((p) => ({
  id: p.id,
  nombre: p.nombre,
  por100: p.por100,
  ...(p.estado ? { estado: p.estado } : {}),
  ...(p.cocido ? { cocido: p.cocido } : {}),
}));

export function todos(propios: Alimento[] = []): Alimento[] {
  const m = new Map<string, Alimento>();
  for (const a of [...DE_LA_COMPRA, ...EXTRA]) m.set(a.id, a);
  for (const a of propios) m.set(a.id, { ...a, propio: true });
  return [...m.values()].sort((a, b) => collator.compare(a.nombre, b.nombre));
}

export function buscar(lista: Alimento[], q: string, max = 8): Alimento[] {
  const qs = palabras(q);
  if (!qs.length) return [];
  const encaja = lista.filter((a) => {
    const ps = palabras(a.nombre);
    return qs.every((w) => ps.some((p) => p.startsWith(w)));
  });
  const empieza = (a: Alimento) => (norm(a.nombre).startsWith(qs[0]) ? 0 : 1);
  return encaja.sort((a, b) => empieza(a) - empieza(b)).slice(0, max);
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function macrosDe(a: Alimento, g: number, hecho = false): Macros {
  const div = hecho && a.cocido ? a.cocido : 1;
  const f = (v: number) => r2((v * g) / 100 / div);
  return { kcal: f(a.por100.kcal), prot: f(a.por100.prot), hc: f(a.por100.hc), grasa: f(a.por100.grasa) };
}

export function aSnack(pesadas: Pesada[], lista: Alimento[], nombre = ''): Snack {
  const porId = new Map(lista.map((a) => [a.id, a]));
  const validas = pesadas.filter((p) => p.g > 0 && porId.has(p.id)).map((p): Pesada => (p.hecho ? { id: p.id, g: p.g, hecho: true } : { id: p.id, g: p.g }));
  const t = { kcal: 0, prot: 0, hc: 0, grasa: 0 };
  for (const p of validas) {
    const m = macrosDe(porId.get(p.id)!, p.g, p.hecho);
    t.kcal += m.kcal;
    t.prot += m.prot;
    t.hc += m.hc;
    t.grasa += m.grasa;
  }
  const linea = (p: Pesada, sep: string) => `${porId.get(p.id)!.nombre}${sep}${p.g} g${p.hecho ? ' hecho' : ''}`;
  const titulo = nombre.trim() || (validas.length === 1 ? linea(validas[0], ' · ') : validas.map((p) => linea(p, ' ')).join(' + '));
  return { t: titulo, kcal: Math.round(t.kcal), p: Math.round(t.prot), hc: Math.round(t.hc), grasa: Math.round(t.grasa), items: validas };
}

export interface CamposAlimento {
  nombre: string;
  kcal: string;
  prot: string;
  hc: string;
  grasa: string;
}

export type ResultadoAlimento = { ok: true; alimento: Alimento } | { ok: false; error: string };

const leer = (s: string): number | null => {
  const t = s.trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
};

// `base`: el alimento que se está editando. Conserva su id (así sustituye al de
// la lista) y cómo cambia al cocinarse.
export function nuevoAlimento(c: CamposAlimento, lista: Alimento[], base?: Alimento): ResultadoAlimento {
  const nombre = c.nombre.trim().replace(/\s+/g, ' ');
  if (!nombre) return { ok: false, error: 'Ponle un nombre.' };
  const kcal = leer(c.kcal);
  if (kcal == null) return { ok: false, error: 'Faltan las kcal por 100 g.' };
  if (Number.isNaN(kcal) || kcal < 0 || kcal > 900) return { ok: false, error: 'Las kcal van de 0 a 900 por 100 g.' };
  const resto: Record<'prot' | 'hc' | 'grasa', number> = { prot: 0, hc: 0, grasa: 0 };
  const NOMBRES = { prot: 'La proteína', hc: 'Los hidratos', grasa: 'La grasa' };
  for (const k of ['prot', 'hc', 'grasa'] as const) {
    const v = leer(c[k]) ?? 0;
    if (Number.isNaN(v) || v < 0 || v > 100) return { ok: false, error: `${NOMBRES[k]} va de 0 a 100 g por 100 g.` };
    resto[k] = v;
  }
  let id = base?.id;
  if (!id) {
    const raiz = `propio-${palabras(nombre).join('-')}`;
    const usados = new Set(lista.map((a) => a.id));
    id = raiz;
    for (let i = 2; usados.has(id); i++) id = `${raiz}-${i}`;
  }
  const alimento: Alimento = { id, nombre, por100: { kcal, ...resto } };
  if (base?.estado) alimento.estado = base.estado;
  if (base?.cocido) alimento.cocido = base.cocido;
  return { ok: true, alimento };
}
