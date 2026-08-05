import { hoyISO } from './db';
import type { DiaRegistro, Sesion } from './types';

export interface CeldaDia {
  fecha: string;
  diaIds: string[];
  descanso: boolean;
  futuro: boolean;
}

export interface SemanaHistorial {
  lunes: string;
  entrenos: number;
  dias: CeldaDia[];
}

function lunesDe(d: Date): Date {
  const l = new Date(d);
  l.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return l;
}

function sesionesPorFecha(sesiones: Sesion[]): Map<string, string[]> {
  const porFecha = new Map<string, string[]>();
  for (const s of sesiones) {
    if (s.estado !== 'finalizada') continue;
    const ids = porFecha.get(s.fecha) ?? [];
    if (!ids.includes(s.diaId)) ids.push(s.diaId);
    porFecha.set(s.fecha, ids);
  }
  return porFecha;
}

export function semanasHistorial(
  sesiones: Sesion[],
  diario: Record<string, DiaRegistro>,
  nSemanas: number,
  hoy: Date = new Date(),
): SemanaHistorial[] {
  const hoyStr = hoyISO(hoy);
  const porFecha = sesionesPorFecha(sesiones);
  const semanas: SemanaHistorial[] = [];
  for (let w = 0; w < nSemanas; w++) {
    const lunes = lunesDe(hoy);
    lunes.setDate(lunes.getDate() - w * 7);
    const dias: CeldaDia[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      const fecha = hoyISO(d);
      dias.push({
        fecha,
        diaIds: porFecha.get(fecha) ?? [],
        descanso: diario[fecha]?.descanso === true,
        futuro: fecha > hoyStr,
      });
    }
    semanas.push({ lunes: hoyISO(lunes), entrenos: dias.filter((c) => c.diaIds.length > 0).length, dias });
  }
  return semanas;
}

function celda(
  fecha: string,
  hoyStr: string,
  porFecha: Map<string, string[]>,
  diario: Record<string, DiaRegistro>,
): CeldaDia {
  return {
    fecha,
    diaIds: porFecha.get(fecha) ?? [],
    descanso: diario[fecha]?.descanso === true,
    futuro: fecha > hoyStr,
  };
}

// Ventana rodante alrededor de hoy: para quien entrena por sensaciones, no por
// día de la semana. `atras` días previos + hoy + `adelante` días futuros.
export function ventanaDias(
  sesiones: Sesion[],
  diario: Record<string, DiaRegistro>,
  atras: number,
  adelante: number,
  hoy: Date = new Date(),
): CeldaDia[] {
  const hoyStr = hoyISO(hoy);
  const porFecha = sesionesPorFecha(sesiones);
  const dias: CeldaDia[] = [];
  for (let i = -atras; i <= adelante; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    dias.push(celda(hoyISO(d), hoyStr, porFecha, diario));
  }
  return dias;
}

export interface MesHistorial {
  anio: number;
  mes: number; // 0-11
  entrenos: number;
  // Empieza en lunes; las celdas de relleno (antes del 1 y tras el último) son null.
  celdas: (CeldaDia | null)[];
}

export function mesHistorial(
  sesiones: Sesion[],
  diario: Record<string, DiaRegistro>,
  anio: number,
  mes: number,
  hoy: Date = new Date(),
): MesHistorial {
  const hoyStr = hoyISO(hoy);
  const porFecha = sesionesPorFecha(sesiones);
  const primero = new Date(anio, mes, 1);
  const dias = new Date(anio, mes + 1, 0).getDate();
  const hueco = (primero.getDay() + 6) % 7; // lunes = 0
  const celdas: (CeldaDia | null)[] = Array.from({ length: hueco }, () => null);
  for (let d = 1; d <= dias; d++) {
    celdas.push(celda(hoyISO(new Date(anio, mes, d)), hoyStr, porFecha, diario));
  }
  while (celdas.length % 7 !== 0) celdas.push(null);
  return {
    anio,
    mes,
    entrenos: celdas.filter((c) => c && c.diaIds.length > 0).length,
    celdas,
  };
}

// null = nunca entrenado. 0 = hoy.
export function diasDesdeUltimaVez(sesiones: Sesion[], diaId: string, hoy: Date = new Date()): number | null {
  const fechas = sesiones
    .filter((s) => s.estado === 'finalizada' && s.diaId === diaId)
    .map((s) => s.fecha)
    .sort();
  const ultima = fechas[fechas.length - 1];
  if (!ultima) return null;
  const ms = Date.parse(`${hoyISO(hoy)}T12:00:00`) - Date.parse(`${ultima}T12:00:00`);
  return Math.max(0, Math.round(ms / 86_400_000));
}
