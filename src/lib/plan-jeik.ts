// Calendario del plan de Jeik: seis meses desde el lunes 2/11/2026, por bloques
// de un mes con revisión al final. Navidad cuenta como semanas de mantener.

export const INICIO = '2026-11-02';
export const BLOQUE = 1;
export const REVISION = '2026-11-29';
export const NAVIDAD: [string, string] = ['2026-12-21', '2027-01-10'];
export const CARDIO_SEMANA = 2;

const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function sumarDias(s: string, n: number): string {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
}

export const lunesDe = (s: string): string => sumarDias(s, -((parse(s).getDay() + 6) % 7));
export const semanaDe = (s: string): string[] => Array.from({ length: 7 }, (_, i) => sumarDias(lunesDe(s), i));
export const esDomingo = (s: string): boolean => parse(s).getDay() === 0;

export function semanaN(s: string): number {
  const dias = Math.round((parse(lunesDe(s)).getTime() - parse(INICIO).getTime()) / 86_400_000);
  return Math.max(1, Math.floor(dias / 7) + 1);
}

export const fase = (sem: number): string => (sem <= 4 ? 'Volver' : sem <= 18 ? 'Construir' : 'Afinar');

// Repeticiones que dejar en el depósito: entrada suave y luego cerca del fallo.
export const deposito = (sem: number): string => (sem <= 2 ? '3' : sem === 3 ? '2' : '0–1');

export const enNavidad = (s: string): boolean => lunesDe(s) >= NAVIDAD[0] && lunesDe(s) <= NAVIDAD[1];
export const metaGym = (s: string): number => (enNavidad(s) ? 2 : 3);

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export const fmtCorto = (s: string): string => `${parse(s).getDate()} ${MESES[parse(s).getMonth()]}`;
export const fmtFecha = (s: string): string => `${DIAS[parse(s).getDay()]} ${fmtCorto(s)}`;
