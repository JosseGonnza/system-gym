// Hoy de Jose como trayecto: dónde está (día del plan, semana) y hacia dónde va
// (peso y cintura, lo que ha subido el motor, récords y el total acumulado).

import type { FilaSerie } from './datos';
import { lunesDe, sumarDias } from './plan-jeik';
import type { Rutina, Sesion } from './types';

const DIA_MS = 86_400_000;
const r1 = (n: number) => Math.round(n * 10) / 10;
const finalizadas = (sesiones: Sesion[]) => sesiones.filter((s) => s.estado === 'finalizada');

export const diaDelPlan = (inicio: string, hoy: string): number =>
  Math.round((Date.parse(`${hoy}T12:00:00`) - Date.parse(`${inicio}T12:00:00`)) / DIA_MS) + 1;

export interface CeldaSemana {
  fecha: string;
  letra: string;
  diaId: string | null;
  cardio: boolean;
  hoy: boolean;
  futuro: boolean;
}

export interface Semana {
  gym: number;
  objetivo: number;
  cardioSesiones: number;
  cardioMin: number;
  dias: CeldaSemana[];
}

export function semanaActual(sesiones: Sesion[], rutinas: Rutina[], hoy: string, objetivo: number): Semana {
  const fueraDeRueda = new Set(rutinas.flatMap((r) => r.dias.filter((d) => d.fueraDeRueda).map((d) => `${r.id}/${d.id}`)));
  const esCardio = (s: Sesion) => fueraDeRueda.has(`${s.rutinaId}/${s.diaId}`);
  const lunes = lunesDe(hoy);
  const fechas = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const deLaSemana = finalizadas(sesiones).filter((s) => fechas.includes(s.fecha));
  const cardio = deLaSemana.filter(esCardio);
  const segundos = cardio.flatMap((s) => s.ejercicios.flatMap((e) => e.series)).reduce((n, x) => n + (x.estado === 'pendiente' ? 0 : (x.segundos ?? 0)), 0);
  return {
    gym: new Set(deLaSemana.filter((s) => !esCardio(s)).map((s) => s.fecha)).size,
    objetivo,
    cardioSesiones: cardio.length,
    cardioMin: Math.round(segundos / 60),
    dias: fechas.map((fecha, i) => ({
      fecha,
      letra: 'LMXJVSD'[i],
      diaId: deLaSemana.find((s) => s.fecha === fecha && !esCardio(s))?.diaId ?? null,
      cardio: cardio.some((s) => s.fecha === fecha),
      hoy: fecha === hoy,
      futuro: fecha > hoy,
    })),
  };
}

export interface SerieMedida {
  actual: number;
  primera: number;
  desde: string;
  delta: number;
  puntos: { fecha: string; valor: number }[];
}

export function serieMedida(xs: { fecha: string; valor: number }[]): SerieMedida | null {
  if (!xs.length) return null;
  const puntos = [...xs].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const [primera, actual] = [puntos[0], puntos[puntos.length - 1]];
  return { actual: actual.valor, primera: primera.valor, desde: primera.fecha, delta: r1(actual.valor - primera.valor), puntos };
}

// Peso máximo movido en cada sesión, por ejercicio y en orden de fecha.
function maximos(sesiones: Sesion[]): Map<string, { fecha: string; kg: number }[]> {
  const m = new Map<string, { fecha: string; kg: number }[]>();
  const orden = finalizadas(sesiones).sort((a, b) => a.fecha.localeCompare(b.fecha));
  for (const s of orden) {
    for (const e of s.ejercicios) {
      const pesos = e.series.filter((x) => x.estado !== 'pendiente' && x.peso != null).map((x) => x.peso!);
      if (!pesos.length) continue;
      const lista = m.get(e.nombre) ?? [];
      lista.push({ fecha: s.fecha, kg: Math.max(...pesos) });
      m.set(e.nombre, lista);
    }
  }
  return m;
}

// Con pocas sesiones el primer peso aún es de calibrar (20 → 65 en tres días)
// y se comería la lista.
const MIN_SESIONES = 4;

export function subidasMotor(sesiones: Sesion[], n: number): { nombre: string; desde: number; hasta: number }[] {
  return [...maximos(sesiones)]
    .filter(([, xs]) => xs.length >= MIN_SESIONES)
    .map(([nombre, xs]) => ({ nombre, desde: xs[0].kg, hasta: xs[xs.length - 1].kg }))
    .filter((x) => x.hasta > x.desde)
    .sort((a, b) => b.hasta - b.desde - (a.hasta - a.desde))
    .slice(0, n);
}

export function recordsRecientes(sesiones: Sesion[], n: number): { nombre: string; kg: number; fecha: string }[] {
  const out: { nombre: string; kg: number; fecha: string }[] = [];
  for (const [nombre, xs] of maximos(sesiones)) {
    let mejor = xs[0].kg;
    let ultimo: { nombre: string; kg: number; fecha: string } | null = null;
    for (const x of xs.slice(1)) {
      if (x.kg > mejor) {
        mejor = x.kg;
        ultimo = { nombre, kg: x.kg, fecha: x.fecha };
      }
    }
    if (ultimo) out.push(ultimo);
  }
  return out.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, n);
}

export interface Contadores {
  dias: number;
  series: number;
  reps: number;
  toneladas: number;
  horas: number;
  km: number;
}

// Series, reps y toneladas salen de las mismas filas que /datos, para que cuadren.
export function contadores(sesiones: Sesion[], filas: FilaSerie[]): Contadores {
  const fin = finalizadas(sesiones);
  let ms = 0;
  let km = 0;
  for (const s of fin) {
    if (s.inicioISO && s.finISO) ms += Math.max(0, Date.parse(s.finISO) - Date.parse(s.inicioISO));
    for (const e of s.ejercicios) for (const x of e.series) km += x.cardio?.distanciaKm ?? 0;
  }
  return {
    dias: new Set(fin.map((s) => s.fecha)).size,
    series: filas.length,
    reps: filas.reduce((n, f) => n + (f.reps ?? 0), 0),
    toneladas: r1(filas.reduce((n, f) => n + (f.tonelaje ?? 0), 0) / 1000),
    horas: Math.round(ms / 3_600_000),
    km: r1(km),
  };
}
