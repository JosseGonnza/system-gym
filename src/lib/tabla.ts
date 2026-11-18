import type { FilaSerie } from './datos';

export type TipoCol = 'texto' | 'num' | 'fecha' | 'bool';
export type Clave = Exclude<keyof FilaSerie, 'id' | 'sesionId' | 'ejercicioId'>;

export interface Columna {
  key: Clave;
  titulo: string;
  tipo: TipoCol;
  dec?: number;
  ayuda?: string;
}

export const COLUMNAS: Columna[] = [
  { key: 'fecha', titulo: 'Fecha', tipo: 'fecha' },
  { key: 'semana', titulo: 'Semana', tipo: 'texto' },
  { key: 'rutina', titulo: 'Rutina', tipo: 'texto' },
  { key: 'dia', titulo: 'Día', tipo: 'texto' },
  { key: 'ejercicio', titulo: 'Ejercicio', tipo: 'texto' },
  { key: 'musculo', titulo: 'Músculo', tipo: 'texto', ayuda: 'El principal que trabaja' },
  { key: 'patron', titulo: 'Patrón', tipo: 'texto' },
  { key: 'implemento', titulo: 'Implemento', tipo: 'texto' },
  { key: 'n', titulo: 'Serie', tipo: 'num', dec: 0 },
  { key: 'kg', titulo: 'Kg', tipo: 'num', dec: 2, ayuda: 'Lo que apuntaste en la app (por lado en barra y multipower)' },
  { key: 'lastre', titulo: 'Lastre', tipo: 'num', dec: 2, ayuda: 'En negativo, asistencia' },
  { key: 'kgReal', titulo: 'Kg real', tipo: 'num', dec: 2, ayuda: 'Lo que mueves: barra + discos, o tu peso ± lastre. En mancuernas, por mano' },
  { key: 'reps', titulo: 'Reps', tipo: 'num', dec: 0 },
  { key: 'seg', titulo: 'Seg', tipo: 'num', dec: 0 },
  { key: 'estado', titulo: 'Estado', tipo: 'texto' },
  { key: 'e1rm', titulo: '1RM est.', tipo: 'num', dec: 1, ayuda: 'Epley sobre el kg real, hasta 12 reps' },
  { key: 'tonelaje', titulo: 'Tonelaje', tipo: 'num', dec: 0, ayuda: 'Kg real × reps' },
  { key: 'sensacion', titulo: 'Sensación', tipo: 'texto' },
  { key: 'molestia', titulo: 'Molestia', tipo: 'bool' },
  { key: 'sueno', titulo: 'Sueño', tipo: 'num', dec: 1, ayuda: 'Horas, de la sesión' },
  { key: 'energia', titulo: 'Energía', tipo: 'num', dec: 0, ayuda: '1-5, de la sesión' },
];

const TIPO = new Map(COLUMNAS.map((c) => [c.key, c.tipo]));

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const num = (s: string): number | null => {
  const t = s.trim().replace(',', '.');
  return t !== '' && Number.isFinite(Number(t)) ? Number(t) : null;
};

type Valor = string | number | boolean | null;

function comparar<T>(op: string, v: T, x: T, igual: (a: T, b: T) => boolean): boolean {
  switch (op) {
    case '>': return v > x;
    case '>=': return v >= x;
    case '<': return v < x;
    case '<=': return v <= x;
    case '!': case '!=': return !igual(v, x);
    default: return igual(v, x);
  }
}

// Mini lenguaje de filtro por columna: texto contiene (=exacto, !excluye);
// números y fechas con > >= < <= = !, o rango «a..b». Lo que no se entiende
// no filtra, para que la tabla no se vacíe a media tecla.
export function cumple(v: Valor, expr: string, tipo: TipoCol): boolean {
  const e = expr.trim();
  if (!e) return true;

  if (tipo === 'bool') {
    const n = norm(e);
    if (n.startsWith('s')) return v === true;
    if (n.startsWith('n')) return v !== true;
    return true;
  }

  if (tipo === 'texto') {
    const s = norm(String(v ?? ''));
    if (e.startsWith('=')) return s === norm(e.slice(1));
    if (e.startsWith('!')) {
      const t = norm(e.slice(1));
      return !t || !s.includes(t);
    }
    return s.includes(norm(e));
  }

  const rango = e.match(/^(.+?)\.\.(.+)$/);
  const op = e.match(/^(>=|<=|!=|>|<|=|!)\s*(.*)$/);

  if (tipo === 'num') {
    if (rango) {
      const a = num(rango[1]);
      const b = num(rango[2]);
      if (a == null || b == null) return true;
      return typeof v === 'number' && v >= a && v <= b;
    }
    const x = num(op ? op[2] : e);
    if (x == null) return true;
    if (typeof v !== 'number') return false;
    return comparar(op ? op[1] : '=', v, x, (a, b) => Math.abs(a - b) < 1e-9);
  }

  const s = String(v ?? '');
  if (rango) return !!s && s >= rango[1].trim() && s <= rango[2].trim();
  if (op) {
    const x = op[2].trim();
    if (!x) return true;
    if (!s) return false;
    return comparar(op[1], s, x, (a, b) => a.startsWith(b));
  }
  return s.startsWith(e);
}

export function filtrar(filas: FilaSerie[], filtros: Partial<Record<Clave, string>>): FilaSerie[] {
  const activos = (Object.entries(filtros) as [Clave, string][]).filter(([, e]) => e.trim());
  if (!activos.length) return filas;
  return filas.filter((f) => activos.every(([k, e]) => cumple(f[k], e, TIPO.get(k) ?? 'texto')));
}

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

export function ordenar(filas: FilaSerie[], key: Clave, dir: 'asc' | 'desc'): FilaSerie[] {
  const s = dir === 'asc' ? 1 : -1;
  return filas
    .map((f, i) => [f, i] as const)
    .sort(([a, ia], [b, ib]) => {
      const va = a[key];
      const vb = b[key];
      const na = va == null || va === '';
      const nb = vb == null || vb === '';
      if (na || nb) return na === nb ? ia - ib : na ? 1 : -1;
      const c = typeof va === 'string' && typeof vb === 'string' ? collator.compare(va, vb) : Number(va) - Number(vb);
      return c * s || ia - ib;
    })
    .map(([f]) => f);
}

export interface Resumen {
  series: number;
  sesiones: number;
  reps: number;
  tonelaje: number;
  e1rmMax: number | null;
  pctFallo: number;
}

export function resumen(filas: FilaSerie[]): Resumen {
  let reps = 0;
  let ton = 0;
  let max: number | null = null;
  let fallo = 0;
  const ses = new Set<string>();
  for (const f of filas) {
    ses.add(f.sesionId);
    reps += f.reps ?? 0;
    ton += f.tonelaje ?? 0;
    if (f.e1rm != null && (max == null || f.e1rm > max)) max = f.e1rm;
    if (f.estado === 'fallo') fallo++;
  }
  return {
    series: filas.length,
    sesiones: ses.size,
    reps,
    tonelaje: Math.round(ton * 10) / 10,
    e1rmMax: max,
    pctFallo: filas.length ? Math.round((fallo / filas.length) * 1000) / 10 : 0,
  };
}

const celdaCSV = (v: Valor): string => {
  if (v == null) return '';
  if (typeof v === 'boolean') return v ? 'sí' : 'no';
  if (typeof v === 'number') return String(v).replace('.', ',');
  return /[;"\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};

// Punto y coma y coma decimal: es lo que espera el Excel en español.
export function aCSV(filas: FilaSerie[], cols: Columna[]): string {
  return [cols.map((c) => c.titulo).join(';'), ...filas.map((f) => cols.map((c) => celdaCSV(f[c.key])).join(';'))].join('\r\n');
}
