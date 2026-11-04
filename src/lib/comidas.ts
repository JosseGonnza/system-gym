// Diario de comidas por bloques (perfil con seguimiento): un toque por comida.
// Del plan (una opción o un plato montado), otra cosa con texto o saltada. El
// snack es libre y admite varias entradas al día.

export type BloqueId = 'desayuno' | 'comida' | 'cena';
export type SegId = 'prot' | 'carb' | 'verd' | 'gras';
export type SelPlato = Record<SegId, string>;

export type RegComida =
  | { tipo: 'opcion'; id: string }
  | { tipo: 'plato'; sel: SelPlato }
  | { tipo: 'otra'; texto: string }
  | { tipo: 'salto' };

export interface Snack {
  t: string;
  kcal?: number;
  p?: number;
}

export type DiaComidas = Partial<Record<BloqueId, RegComida>> & { snack?: Snack[] };

export interface Bloque {
  id: BloqueId;
  nombre: string;
  corto: string;
  kcal: number;
  p: number;
  plato?: boolean;
}

export const BLOQUES: Bloque[] = [
  { id: 'desayuno', nombre: 'Desayuno', corto: 'Desay.', kcal: 250, p: 15 },
  { id: 'comida', nombre: 'Comida', corto: 'Comida', kcal: 900, p: 60, plato: true },
  { id: 'cena', nombre: 'Cena', corto: 'Cena', kcal: 750, p: 55, plato: true },
];

export const OBJETIVO_DIA = { kcal: 2300, p: 150 };
export const SNACK_DIA = { kcal: 400, p: 20 };

export const SNACKS: Required<Snack>[] = [
  { t: 'Un plátano o una manzana', kcal: 90, p: 1 },
  { t: 'Dos yogures 0 %', kcal: 100, p: 10 },
  { t: 'Pavo en lonchas y una manzana', kcal: 150, p: 14 },
  { t: 'Batido de proteína', kcal: 130, p: 24 },
  { t: 'Bocadillito de pavo o jamón york', kcal: 250, p: 18 },
  { t: 'Tostada con queso fresco', kcal: 180, p: 10 },
];

export interface Opcion {
  id: string;
  nombre: string;
  items: [string, string][];
  kcal: number;
  p: number;
}

export const OPCIONES: Record<BloqueId, Opcion[]> = {
  desayuno: [
    { id: 'd1', nombre: 'Café con leche y tostada de pavo', items: [['200 ml', 'leche semi en el café'], ['40 g', 'pan'], ['40 g', 'pavo en lonchas'], ['', 'tomate']], kcal: 240, p: 18 },
    { id: 'd2', nombre: 'Yogur 0 % con plátano y avena', items: [['2', 'yogures naturales 0 %'], ['1', 'plátano'], ['20 g', 'avena']], kcal: 265, p: 14 },
    { id: 'd3', nombre: 'Queso batido con avena', items: [['200 g', 'queso batido 0 %'], ['25 g', 'avena'], ['', 'canela al gusto']], kcal: 190, p: 19 },
    { id: 'd4', nombre: 'Café con leche y un plátano', items: [['200 ml', 'leche semi en el café'], ['1', 'plátano']], kcal: 195, p: 8 },
  ],
  comida: [
    { id: 'c1', nombre: 'Pollo con arroz y verdura', items: [['220 g', 'pechuga de pollo'], ['120 g', 'arroz (en crudo)'], ['200 g', 'verdura'], ['15 g', 'aceite de oliva'], ['1', 'naranja']], kcal: 905, p: 64 },
    { id: 'c2', nombre: 'Lentejas con ternera', items: [['100 g', 'lentejas (en seco)'], ['120 g', 'ternera magra'], ['200 g', 'patata'], ['', 'verdura del guiso'], ['15 g', 'aceite'], ['40 g', 'pan']], kcal: 915, p: 56 },
    { id: 'c5', nombre: 'Pasta boloñesa de ternera', items: [['120 g', 'pasta (en crudo)'], ['150 g', 'ternera picada magra'], ['200 g', 'tomate triturado'], ['100 g', 'verdura'], ['15 g', 'aceite'], ['20 g', 'queso rallado']], kcal: 915, p: 57 },
    { id: 'c4', nombre: 'Ternera con patatas', items: [['220 g', 'ternera magra'], ['350 g', 'patata'], ['', 'ensalada'], ['15 g', 'aceite'], ['40 g', 'pan'], ['1', 'manzana']], kcal: 925, p: 59 },
  ],
  cena: [
    { id: 'n1', nombre: 'Merluza con patata', items: [['280 g', 'merluza o pescado blanco'], ['300 g', 'patata'], ['', 'verdura'], ['15 g', 'aceite'], ['40 g', 'pan']], kcal: 780, p: 61 },
    { id: 'n2', nombre: 'Tortilla francesa con pavo', items: [['3', 'huevos'], ['80 g', 'pavo en lonchas'], ['80 g', 'pan'], ['60 g', 'queso fresco'], ['', 'ensalada'], ['10 g', 'aceite']], kcal: 720, p: 53 },
    { id: 'n5', nombre: 'Lomo con boniato', items: [['200 g', 'lomo de cerdo'], ['250 g', 'boniato'], ['', 'verdura'], ['40 g', 'pan'], ['10 g', 'aceite']], kcal: 740, p: 55 },
    { id: 'n4', nombre: 'Pollo con arroz', items: [['220 g', 'pechuga de pollo'], ['80 g', 'arroz (en crudo)'], ['', 'verdura'], ['10 g', 'aceite'], ['2', 'kiwis']], kcal: 740, p: 61 },
  ],
};

export const SEGS: { id: SegId; nombre: string }[] = [
  { id: 'prot', nombre: 'Proteína' },
  { id: 'carb', nombre: 'Hidratos' },
  { id: 'verd', nombre: 'Verdura' },
  { id: 'gras', nombre: 'Grasa' },
];

type BloquePlato = Extract<BloqueId, 'comida' | 'cena'>;

export const PLATO: Record<BloquePlato, { pct: Record<SegId, number>; obj: { prot: number; carb: number }; ojo: { prot: string; carb: string } }> = {
  comida: { pct: { prot: 30, carb: 30, verd: 35, gras: 5 }, obj: { prot: 48, carb: 90 }, ojo: { prot: 'dos palmas generosas', carb: '2 puños y medio, ya cocinado' } },
  cena: { pct: { prot: 30, carb: 20, verd: 45, gras: 5 }, obj: { prot: 44, carb: 60 }, ojo: { prot: 'unas 2 palmas', carb: 'puño y medio, ya cocinado' } },
};

export interface Alimento {
  id: string;
  nombre: string;
  // Por 100 g en crudo: proteína, hidratos, grasa, kcal
  m: [number, number, number, number];
  cocido?: number;
  fijo?: number;
  ojo?: string;
}

export const ALIMENTOS: Record<SegId, Alimento[]> = {
  prot: [
    { id: 'pollo', nombre: 'Pechuga de pollo', m: [23, 0, 2, 110] },
    { id: 'pavo', nombre: 'Pechuga de pavo', m: [24, 0, 1, 105] },
    { id: 'ternera', nombre: 'Ternera magra', m: [21, 0, 6, 140] },
    { id: 'lomo', nombre: 'Lomo de cerdo', m: [22, 0, 5, 135] },
    { id: 'merluza', nombre: 'Merluza o pescado blanco', m: [17, 0, 2, 90] },
  ],
  carb: [
    { id: 'arroz', nombre: 'Arroz', m: [7, 78, 1, 350], cocido: 3 },
    { id: 'pasta', nombre: 'Pasta', m: [12, 72, 1.5, 360], cocido: 2.5 },
    { id: 'patata', nombre: 'Patata', m: [2, 17, 0, 80] },
    { id: 'boniato', nombre: 'Boniato', m: [1.5, 20, 0, 90] },
    { id: 'pan', nombre: 'Pan', m: [9, 50, 3, 260] },
    { id: 'legumbre', nombre: 'Lentejas o garbanzos', m: [22, 50, 4, 320], cocido: 2.5 },
  ],
  verd: [{ id: 'verdura', nombre: 'Verdura u hortaliza', m: [2, 4, 0, 25], fijo: 200, ojo: 'brócoli, judías, calabacín, ensalada, champiñones…' }],
  gras: [
    { id: 'aceite', nombre: 'Aceite de oliva', m: [0, 0, 100, 900], fijo: 10, ojo: '1 cucharada sopera' },
    { id: 'aguacate', nombre: 'Aguacate', m: [2, 2, 15, 160], fijo: 60, ojo: 'medio pequeño' },
    { id: 'nada', nombre: 'Nada más', m: [0, 0, 0, 0], fijo: 0, ojo: 'si llevas ternera o lomo, ya va dentro' },
  ],
};

export const PLATO_DEF: SelPlato = { prot: 'pollo', carb: 'arroz', verd: 'verdura', gras: 'aceite' };

const r10 = (n: number) => Math.round(n / 10) * 10;

export const alimento = (seg: SegId, id: string): Alimento => ALIMENTOS[seg].find((a) => a.id === id) ?? ALIMENTOS[seg][0];

// Gramos en crudo para llegar al objetivo del plato: la proteína manda en su
// trozo y los hidratos en el suyo. Verdura y grasa van en cantidad fija.
export function gramos(seg: SegId, a: Alimento, tipo: BloquePlato): number {
  if (a.fijo !== undefined) return a.fijo;
  const o = PLATO[tipo].obj;
  return seg === 'prot' ? r10((o.prot / a.m[0]) * 100) : r10((o.carb / a.m[1]) * 100);
}

export const gramosCocido = (a: Alimento, g: number): number | null => (a.cocido ? r10(g * a.cocido) : null);

export function platoMacros(sel: SelPlato, tipo: BloquePlato): { kcal: number; p: number } {
  let kcal = 0;
  let p = 0;
  for (const s of SEGS) {
    const a = alimento(s.id, sel[s.id]);
    const g = gramos(s.id, a, tipo);
    kcal += (a.m[3] * g) / 100;
    p += (a.m[0] * g) / 100;
  }
  return { kcal, p };
}

export function platoNombre(sel: SelPlato): string {
  const t = `${alimento('prot', sel.prot).nombre} con ${alimento('carb', sel.carb).nombre}`.toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export type ClaseComida = 'plan' | 'otra' | 'salto';

export function infoComida(
  bloque: BloqueId,
  reg: RegComida | undefined,
): { clase: ClaseComida; texto: string; kcal: number | null; p: number | null } | null {
  if (!reg) return null;
  if (reg.tipo === 'opcion') {
    const o = OPCIONES[bloque].find((x) => x.id === reg.id);
    return o ? { clase: 'plan', texto: o.nombre, kcal: o.kcal, p: o.p } : null;
  }
  if (reg.tipo === 'plato' && bloque !== 'desayuno') {
    const m = platoMacros(reg.sel, bloque);
    return { clase: 'plan', texto: `Tu plato: ${platoNombre(reg.sel)}`, kcal: m.kcal, p: m.p };
  }
  if (reg.tipo === 'otra') return { clase: 'otra', texto: reg.texto, kcal: null, p: null };
  return { clase: 'salto', texto: 'Me la salté', kcal: null, p: null };
}

// Lo que se puede contar: el plan y los snacks de la lista. Lo escrito a mano no
// suma, y se dice cuántas hay para revisarlas juntos.
export function totalesDia(dia: DiaComidas | undefined): { kcal: number; p: number; otras: number } {
  let kcal = 0;
  let p = 0;
  let otras = 0;
  for (const b of BLOQUES) {
    const inf = infoComida(b.id, dia?.[b.id]);
    if (inf?.kcal != null) {
      kcal += inf.kcal;
      p += inf.p ?? 0;
    }
    if (inf?.clase === 'otra') otras++;
  }
  for (const s of dia?.snack ?? []) {
    kcal += s.kcal ?? 0;
    p += s.p ?? 0;
  }
  return { kcal, p, otras };
}

export function resumenComidas(comidas: Record<string, DiaComidas>, fechas: string[]) {
  let plan = 0;
  let otra = 0;
  let salto = 0;
  let snacks = 0;
  for (const f of fechas) {
    const d = comidas[f];
    if (!d) continue;
    for (const b of BLOQUES) {
      const r = d[b.id];
      if (!r) continue;
      if (r.tipo === 'otra') otra++;
      else if (r.tipo === 'salto') salto++;
      else plan++;
    }
    snacks += d.snack?.length ?? 0;
  }
  return { plan, otra, salto, snacks };
}
