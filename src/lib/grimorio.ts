// Lógica pura del Grimorio de Yasmina: lo que pintan sus pantallas sin tocar el
// DOM, para poder probarlo. Spec en la bóveda: 02_LIB/MUSCULO/Yasmina/APP_GRIMORIO.

import type { Rutina, Sesion } from './types';

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
