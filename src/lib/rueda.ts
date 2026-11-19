// Entreno de Jose antes de empezar: la rueda de días y la tarjeta del día.

import type { DiaDef, Sesion } from './types';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const fechaCorta = (f: string): string => `${Number(f.slice(8))} ${MESES[Number(f.slice(5, 7)) - 1]}`;

export function ultimasReps(sesiones: Sesion[], ranuraId: string): number[] {
  const ultima = sesiones
    .filter((s) => s.estado === 'finalizada' && s.ejercicios.some((e) => e.ranuraId === ranuraId))
    .sort((a, b) => (b.inicioISO ?? b.fecha).localeCompare(a.inicioISO ?? a.fecha))[0];
  const series = ultima?.ejercicios.find((e) => e.ranuraId === ranuraId)?.series ?? [];
  return series.filter((x) => x.estado !== 'pendiente' && x.reps != null).map((x) => x.reps!);
}

export const haceDias = (dias: number | null): string =>
  dias == null ? 'sin estrenar' : dias === 0 ? 'hoy' : dias === 1 ? 'ayer' : `hace ${dias} d`;

export function resumenDia(dia: DiaDef, ultima: string | null): string {
  const series = dia.ejercicios.reduce((n, e) => n + e.series, 0);
  return `${dia.ejercicios.length} ejercicios · ${series} series · ${ultima ? `último el ${fechaCorta(ultima)}` : 'sin estrenar'}`;
}
