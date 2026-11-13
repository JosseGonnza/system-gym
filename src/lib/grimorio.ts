// Lógica pura del Grimorio de Yasmina: lo que pintan sus pantallas sin tocar el
// DOM, para poder probarlo. Spec en la bóveda: 02_LIB/MUSCULO/Yasmina/APP_GRIMORIO.

import type { DiaDef, Rutina, Sesion } from './types';

// ── Fase de la luna ──
// Una luna nueva conocida (6/1/2000, 18:14 UTC) y el mes sinódico medio. Error
// de unas horas: de sobra para decir en qué fase está.
const LUNA_NUEVA_REF = Date.UTC(2000, 0, 6, 18, 14);
const MES_SINODICO = 29.530588853;
const FASES = [
  'luna nueva',
  'luna creciente',
  'cuarto creciente',
  'gibosa creciente',
  'luna llena',
  'gibosa menguante',
  'cuarto menguante',
  'luna menguante',
];

export function faseLunar(fecha: Date): string {
  const dias = (fecha.getTime() - LUNA_NUEVA_REF) / 86_400_000;
  const edad = ((dias % MES_SINODICO) + MES_SINODICO) % MES_SINODICO;
  return FASES[Math.floor((edad / MES_SINODICO) * 8 + 0.5) % 8];
}

// ── Nombres de los días ──
// "Glúteo + Pecho + Espalda" se lee mejor como frase: "Glúteo, pecho y espalda".
const partes = (nombre: string) => nombre.split(/\s*\+\s*/).filter(Boolean);

export function nombreBonito(nombre: string): string {
  const p = partes(nombre);
  if (p.length < 2) return nombre;
  const resto = p.slice(1).map((x) => x.toLowerCase());
  return `${p[0]}${resto.length > 1 ? ', ' + resto.slice(0, -1).join(', ') : ''} y ${resto[resto.length - 1]}`;
}

// Para las píldoras de alternativas: las dos primeras partes y basta.
export function nombreCorto(nombre: string): string {
  const p = partes(nombre);
  if (p.length < 2) return nombre;
  return `${p[0]} y ${p[1].toLowerCase()}`;
}

// ── Fechas en ISO local (YYYY-MM-DD) ──
const aFecha = (iso: string) => new Date(`${iso}T12:00:00`);
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const sumarDias = (f: string, n: number): string => {
  const d = aFecha(f);
  d.setDate(d.getDate() + n);
  return iso(d);
};

// ── Las lunas de la semana ──
// Los últimos 7 días, hoy el último. Luna llena = entreno de la rueda; media
// luna = día suave (fuera de rueda); hueco = descanso.
export type TipoLuna = 'llena' | 'suave' | 'vacia';
export interface Luna {
  fecha: string;
  letra: string;
  tipo: TipoLuna;
  hoy: boolean;
}

export function lunasSemana(sesiones: Sesion[], rutinas: Rutina[], hoy: string): { lunas: Luna[]; entrenos: number } {
  const fuera = (s: Sesion) => !!rutinas.find((r) => r.id === s.rutinaId)?.dias.find((d) => d.id === s.diaId)?.fueraDeRueda;
  const fin = sesiones.filter((s) => s.estado === 'finalizada');
  const lunas = Array.from({ length: 7 }, (_, i) => {
    const fecha = sumarDias(hoy, i - 6);
    const del = fin.filter((s) => s.fecha === fecha);
    const tipo: TipoLuna = del.some((s) => !fuera(s)) ? 'llena' : del.length ? 'suave' : 'vacia';
    return { fecha, letra: 'DLMXJVS'[aFecha(fecha).getDay()], tipo, hoy: fecha === hoy };
  });
  return { lunas, entrenos: lunas.filter((l) => l.tipo === 'llena').length };
}

// ── Las estrellas del mes ──
// Una estrella por entreno; las apagadas llegan hasta lo que daría el mes al
// ritmo de su objetivo semanal. Nunca más de 16 (no caben en una fila).
export function estrellasMes(entrenos: number, objetivoSemana: number, anio: number, mes: number): { on: number; total: number } {
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const objetivo = Math.max(1, Math.round((objetivoSemana * diasMes) / 7));
  const total = Math.min(16, Math.max(objetivo, entrenos));
  return { on: Math.min(entrenos, total), total };
}

// ── El Grimorio: su rutina como un libro ──
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const romano = (n: number): string => ROMANOS[n - 1] ?? String(n);

const finalizadas = (sesiones: Sesion[]) =>
  sesiones.filter((s) => s.estado === 'finalizada').sort((a, b) => a.fecha.localeCompare(b.fecha));

// "Capítulo": todas las sesiones desde que empezó, en número normal (decisión
// del 13/11: los romanos largos quedan feos).
export const capitulos = (sesiones: Sesion[]): number => finalizadas(sesiones).length;

// Lo que pone bajo cada marcapáginas: HOY para el que toca, el día de la
// semana si lo hizo hace menos de una semana, la fecha si fue antes.
export function etiquetaMarcador(dia: DiaDef, sesiones: Sesion[], hoy: string, toca: boolean): string {
  if (toca) return 'HOY';
  if (dia.fueraDeRueda) return 'SUAVE';
  const ultima = finalizadas(sesiones).filter((s) => s.diaId === dia.id).pop();
  if (!ultima) return 'NUEVA';
  const f = aFecha(ultima.fecha);
  const dias = Math.round((aFecha(hoy).getTime() - f.getTime()) / 86_400_000);
  if (dias === 0) return 'HECHA';
  if (dias < 7) return f.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
  return f.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase();
}

// Peso (o segundos) de cada sesión para una ranura: el máximo de las series
// que hizo. Las últimas `n`, de la más vieja a la más nueva.
export function tendenciaRanura(sesiones: Sesion[], ranuraId: string, porTiempo: boolean, n = 6): number[] {
  const valores: number[] = [];
  for (const s of finalizadas(sesiones)) {
    const er = s.ejercicios.find((x) => x.ranuraId === ranuraId);
    if (!er) continue;
    const hechas = er.series.filter((x) => x.estado !== 'pendiente');
    const v = Math.max(...hechas.map((x) => (porTiempo ? (x.segundos ?? 0) : (x.peso ?? 0))), 0);
    if (v > 0) valores.push(v);
  }
  return valores.slice(-n);
}

// "Última vez el lunes 9 · te fue fácil en 4 de 6"
export function ultimaVez(sesiones: Sesion[], diaId: string): { fecha: string; faciles: number; valorados: number } | null {
  const s = finalizadas(sesiones).filter((x) => x.diaId === diaId).pop();
  if (!s) return null;
  const valorados = s.ejercicios.filter((e) => e.sensacion);
  return { fecha: s.fecha, faciles: valorados.filter((e) => e.sensacion === 'facil').length, valorados: valorados.length };
}

// ── El diario (Progreso) ──
// Lunes de la semana de una fecha, en ISO.
export const lunesDe = (f: string): string => sumarDias(f, -((aFecha(f).getDay() + 6) % 7));

// Días con entreno de la rueda (no el día suave), sin repetir fecha.
function diasDeRueda(sesiones: Sesion[], rutinas: Rutina[]): Set<string> {
  const fuera = (s: Sesion) => !!rutinas.find((r) => r.id === s.rutinaId)?.dias.find((d) => d.id === s.diaId)?.fueraDeRueda;
  return new Set(finalizadas(sesiones).filter((s) => !fuera(s)).map((s) => s.fecha));
}

// Semanas seguidas (de lunes a domingo) llegando a su objetivo de entrenos. La
// semana en curso suma si ya llegó; si aún no, no rompe la racha: está a medias.
export function racha(sesiones: Sesion[], rutinas: Rutina[], objetivo: number, hoy: string): { actual: number; mejor: number } {
  const dias = diasDeRueda(sesiones, rutinas);
  if (!dias.size) return { actual: 0, mejor: 0 };
  const porSemana = new Map<string, number>();
  for (const f of dias) porSemana.set(lunesDe(f), (porSemana.get(lunesDe(f)) ?? 0) + 1);
  const llega = (l: string) => (porSemana.get(l) ?? 0) >= objetivo;

  const estaSemana = lunesDe(hoy);
  let mejor = 0;
  let tramo = 0;
  for (let l = lunesDe([...dias].sort()[0]); l <= estaSemana; l = sumarDias(l, 7)) {
    tramo = llega(l) ? tramo + 1 : l === estaSemana ? tramo : 0;
    mejor = Math.max(mejor, tramo);
  }
  let actual = llega(estaSemana) ? 1 : 0;
  for (let l = sumarDias(estaSemana, -7); llega(l); l = sumarDias(l, -7)) actual++;
  return { actual, mejor };
}

// El año en estrellas: un punto por día de cada mes.
export type TipoDiaCielo = 'entreno' | 'suave' | 'nada';
export interface DiaCielo {
  fecha: string;
  tipo: TipoDiaCielo;
  futuro: boolean;
}

export function cielo(sesiones: Sesion[], rutinas: Rutina[], anio: number, hoy: string): DiaCielo[][] {
  const rueda = diasDeRueda(sesiones, rutinas);
  const cualquiera = new Set(finalizadas(sesiones).map((s) => s.fecha));
  return Array.from({ length: 12 }, (_, m) =>
    Array.from({ length: new Date(anio, m + 1, 0).getDate() }, (_, d) => {
      const fecha = `${anio}-${String(m + 1).padStart(2, '0')}-${String(d + 1).padStart(2, '0')}`;
      const tipo: TipoDiaCielo = rueda.has(fecha) ? 'entreno' : cualquiera.has(fecha) ? 'suave' : 'nada';
      return { fecha, tipo, futuro: fecha > hoy };
    }),
  );
}

// Peso o cintura: la media de cada semana con datos (las últimas `n`) y la
// tendencia en unidades por semana (recta de mínimos cuadrados).
export function mediasSemanales(entradas: { fecha: string; v: number }[], n = 8): { lunes: string; media: number }[] {
  const grupos = new Map<string, number[]>();
  for (const e of entradas) {
    const l = lunesDe(e.fecha);
    grupos.set(l, [...(grupos.get(l) ?? []), e.v]);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-n)
    .map(([lunes, vs]) => ({ lunes, media: vs.reduce((a, b) => a + b, 0) / vs.length }));
}

export function tendenciaSemanal(medias: { lunes: string; media: number }[]): number | null {
  if (medias.length < 2) return null;
  // Semanas enteras: el cambio de hora haría que una semana mida 7 días y 1 h.
  const x = medias.map((m) => Math.round((aFecha(m.lunes).getTime() - aFecha(medias[0].lunes).getTime()) / (7 * 86_400_000)));
  const y = medias.map((m) => m.media);
  const mx = x.reduce((a, b) => a + b, 0) / x.length;
  const my = y.reduce((a, b) => a + b, 0) / y.length;
  const den = x.reduce((a, xi) => a + (xi - mx) ** 2, 0);
  return den ? x.reduce((a, xi, i) => a + (xi - mx) * (y[i] - my), 0) / den : null;
}

// Marca de un ejercicio: el valor de ahora, desde cuándo y cuánto ha cambiado.
export function marca(
  sesiones: Sesion[],
  ranuraId: string,
  porTiempo: boolean,
): { actual: number; primera: { fecha: string; v: number }; ultimos: number[] } | null {
  const puntos: { fecha: string; v: number }[] = [];
  for (const s of finalizadas(sesiones)) {
    const er = s.ejercicios.find((x) => x.ranuraId === ranuraId);
    const hechas = er?.series.filter((x) => x.estado !== 'pendiente') ?? [];
    const v = Math.max(0, ...hechas.map((x) => (porTiempo ? (x.segundos ?? 0) : (x.peso ?? 0))));
    if (v > 0) puntos.push({ fecha: s.fecha, v });
  }
  if (!puntos.length) return null;
  return { actual: puntos[puntos.length - 1].v, primera: puntos[0], ultimos: puntos.slice(-6).map((p) => p.v) };
}

// ── Frases ──
// Rotan por día del año para que no se repita siempre la misma. Estética de
// grimorio, nada pícaro (decisión de la spec).
const NUMEROS = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis'];
const enLetra = (n: number) => NUMEROS[n] ?? String(n);
const mayus = (s: string) => s[0].toUpperCase() + s.slice(1);

export const FRASES_SIN_ESTRELLAS = [
  'El mes está por escribir. La primera estrella puede ser hoy.',
  'Todavía no hay estrellas. El cielo te espera.',
];

export const FRASES_MES: ((n: number) => string)[] = [
  (n) => `${mayus(enLetra(n))} ${n === 1 ? 'estrella encendida' : 'estrellas encendidas'}. El bosque lo nota.`,
  () => 'Hechizo a hechizo, el grimorio se va llenando.',
  (n) => `Las luciérnagas llevan la cuenta: ${enLetra(n)} ${n === 1 ? 'noche' : 'noches'} de magia.`,
  () => 'La constancia es la magia más difícil, y la estás haciendo.',
  () => 'Cada estrella es un día que viniste. Ninguna se apaga.',
];

export function fraseMes(entrenos: number, hoy: string): string {
  const d = aFecha(hoy);
  const diaAnio = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86_400_000);
  if (entrenos === 0) return FRASES_SIN_ESTRELLAS[diaAnio % FRASES_SIN_ESTRELLAS.length];
  return FRASES_MES[diaAnio % FRASES_MES.length](entrenos);
}
