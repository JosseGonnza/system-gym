import { lunesDe, sumarDias } from './plan-jeik';
import type { Sesion } from './types';

export type Nivel = 0 | 1 | 2 | 3 | 4;

export interface CeldaAnual {
  fecha: string;
  min: number;
  nivel: Nivel;
  futuro: boolean;
}

export interface Anual {
  semanas: CeldaAnual[][];
  meses: { col: number; mes: number }[];
  entrenos: number;
  racha: number;
}

export const SEMANAS = 53;

// Por minutos y no por series: el día de cardio son tres máquinas de una serie.
export function nivel(min: number): Nivel {
  if (min <= 0) return 0;
  if (min < 30) return 1;
  if (min < 45) return 2;
  if (min < 60) return 3;
  return 4;
}

function porFecha(sesiones: Sesion[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of sesiones) {
    if (s.estado !== 'finalizada') continue;
    m.set(s.fecha, (m.get(s.fecha) ?? 0) + (s.duracionMin ?? 0));
  }
  return m;
}

// La semana en curso no rompe la racha mientras no ha terminado.
function racha(semanas: CeldaAnual[][], dias: Map<string, number>, objetivo: number, hoy: string): number {
  let n = 0;
  for (let i = semanas.length - 1; i >= 0; i--) {
    const hechos = semanas[i].filter((c) => dias.has(c.fecha)).length;
    if (hechos >= objetivo) n++;
    else if (!semanas[i].some((c) => c.fecha === hoy)) break;
  }
  return n;
}

export function anual(sesiones: Sesion[], hoy: string, objetivo: number): Anual {
  const dias = porFecha(sesiones);
  const primero = sumarDias(lunesDe(hoy), -7 * (SEMANAS - 1));
  const semanas: CeldaAnual[][] = [];
  const meses: Anual['meses'] = [];
  for (let w = 0; w < SEMANAS; w++) {
    const lunes = sumarDias(primero, 7 * w);
    semanas.push(
      Array.from({ length: 7 }, (_, d) => {
        const fecha = sumarDias(lunes, d);
        const min = dias.get(fecha) ?? 0;
        return { fecha, min, nivel: dias.has(fecha) ? (Math.max(1, nivel(min)) as Nivel) : 0, futuro: fecha > hoy };
      }),
    );
    const mes = Number(lunes.slice(5, 7)) - 1;
    if (w === 0 || mes !== meses[meses.length - 1].mes) meses.push({ col: w, mes });
  }
  if (meses.length > 1 && meses[1].col < 3) meses.shift();
  const desde = sumarDias(hoy, -364);
  const entrenos = [...dias.keys()].filter((f) => f >= desde && f <= hoy).length;
  return { semanas, meses, entrenos, racha: racha(semanas, dias, objetivo, hoy) };
}
