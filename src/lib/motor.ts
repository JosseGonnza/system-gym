import type { EjercicioDef, SerieReg } from './types';

export interface PuntoHistorial {
  fecha: string;
  series: SerieReg[];
}

export interface Sugerencia {
  peso: number | null;
  reps: number | null;
  segundos: number | null;
  lastreKg: number | null;
  texto: string;
  aviso?: string;
}

const DIAS_PARON = 14;

const VACIA: Sugerencia = { peso: null, reps: null, segundos: null, lastreKg: null, texto: '' };

const fmtKg = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 2 });

function redondear(x: number, paso: number): number {
  return Math.round((Math.round(x / paso) * paso) * 100) / 100;
}

function diasDesde(fecha: string): number {
  return Math.floor((Date.now() - new Date(`${fecha}T12:00:00`).getTime()) / 86_400_000);
}

function hechas(p: PuntoHistorial): SerieReg[] {
  return p.series.filter((s) => s.estado !== 'pendiente');
}

function todasCompletas(p: PuntoHistorial, e: EjercicioDef): boolean {
  const s = hechas(p);
  return s.length >= e.series && s.every((x) => x.estado === 'completada');
}

function todasAlTope(p: PuntoHistorial, e: EjercicioDef, tope: number): boolean {
  const s = hechas(p);
  return s.length >= e.series && s.every((x) => x.estado === 'completada' && (x.reps ?? 0) >= tope);
}

export function sugerir(e: EjercicioDef, historial: PuntoHistorial[], incrementoMin: number): Sugerencia {
  if (e.tipoProgresion === 'libre') return { ...VACIA, texto: 'Libre: apunta lo que hagas' };

  const ultimo = historial[0];
  if (!ultimo || hechas(ultimo).length === 0) {
    const reps = Array.isArray(e.repsObjetivo) ? e.repsObjetivo[0] : e.repsObjetivo;
    return {
      ...VACIA,
      reps,
      texto: 'Calibración: encuentra tu peso',
      aviso: 'Sin historial. Busca un peso que te deje 2-3 reps en la recámara.',
    };
  }

  const incr = e.incrementoKg ?? incrementoMin;
  const series = hechas(ultimo);
  const maxReps = Math.max(0, ...series.map((s) => s.reps ?? 0));
  const pesoUlt = series.find((s) => s.peso != null)?.peso ?? null;
  const lastreUlt = Math.max(0, ...series.map((s) => s.lastreKg ?? 0));
  const segUlt = Math.max(0, ...series.map((s) => s.segundos ?? 0));
  const paron = diasDesde(ultimo.fecha) > DIAS_PARON;
  const avisoParon = paron
    ? `Vuelves de un parón (${diasDesde(ultimo.fecha)} días): repite peso o baja un 10%. Ve con cabeza.`
    : undefined;

  if (e.tipoProgresion === 'tiempo') {
    const seg = segUlt > 0 ? (paron ? segUlt : segUlt + 5) : null;
    return { ...VACIA, segundos: seg, texto: seg ? `Sugerido: ${seg} s` : 'Apunta tus segundos', aviso: avisoParon };
  }

  if (e.tipoProgresion === 'lineal') {
    const reps = typeof e.repsObjetivo === 'number' ? e.repsObjetivo : null;
    if (pesoUlt == null) {
      return { ...VACIA, reps, texto: 'Calibración: encuentra tu peso' };
    }
    if (paron) {
      return { ...VACIA, peso: pesoUlt, reps, texto: `Repite: ${fmtKg(pesoUlt)} kg × ${reps}`, aviso: avisoParon };
    }
    if (todasCompletas(ultimo, e)) {
      const peso = redondear(pesoUlt + incr, incr);
      return { ...VACIA, peso, reps, texto: `Sugerido: ${fmtKg(peso)} kg × ${reps} (+${fmtKg(incr)})` };
    }
    const previo = historial[1];
    const falloPrevio =
      previo &&
      hechas(previo).some((s) => s.peso === pesoUlt) &&
      !todasCompletas(previo, e);
    if (falloPrevio) {
      const peso = redondear(pesoUlt * 0.9, incr);
      return {
        ...VACIA,
        peso,
        reps,
        texto: `Deload: ${fmtKg(peso)} kg × ${reps} (−10%)`,
        aviso: 'Dos sesiones falladas con este peso. Baja, coge carrerilla y vuelve a subir.',
      };
    }
    return { ...VACIA, peso: pesoUlt, reps, texto: `Repite: ${fmtKg(pesoUlt)} kg × ${reps}` };
  }

  const [lo, hi] = e.repsObjetivo as [number, number];

  if (e.tipoProgresion === 'doble') {
    if (pesoUlt == null) return { ...VACIA, reps: lo, texto: 'Calibración: encuentra tu peso' };
    if (paron) {
      return { ...VACIA, peso: pesoUlt, reps: Math.min(hi, Math.max(lo, maxReps)), texto: `Repite: ${fmtKg(pesoUlt)} kg`, aviso: avisoParon };
    }
    if (todasAlTope(ultimo, e, hi)) {
      const peso = redondear(pesoUlt + incr, incr);
      return { ...VACIA, peso, reps: lo, texto: `Sube peso: ${fmtKg(peso)} kg × ${lo} (+${fmtKg(incr)})` };
    }
    const reps = Math.min(hi, Math.max(lo, maxReps + 1));
    return { ...VACIA, peso: pesoUlt, reps, texto: `Mismo peso, busca ${reps} reps (rango ${lo}-${hi})` };
  }

  // pesoCorporal
  if (paron) {
    return {
      ...VACIA,
      lastreKg: lastreUlt || null,
      reps: Math.min(hi, Math.max(lo, maxReps)),
      texto: 'Repite lo del último día',
      aviso: avisoParon,
    };
  }
  if (todasAlTope(ultimo, e, hi)) {
    const lastre = redondear(lastreUlt + incr, incr);
    return { ...VACIA, lastreKg: lastre, reps: lo, texto: `Añade lastre: +${fmtKg(lastre)} kg × ${lo}` };
  }
  const reps = Math.min(hi, Math.max(lo, maxReps + 1));
  return {
    ...VACIA,
    lastreKg: lastreUlt || null,
    reps,
    texto: `${lastreUlt ? `Lastre +${fmtKg(lastreUlt)} kg, ` : ''}busca ${reps} reps (rango ${lo}-${hi})`,
  };
}

export function historialDeRanura(
  sesiones: { fecha: string; estado: string; ejercicios: { ranuraId: string; series: SerieReg[] }[] }[],
  ranuraId: string,
): PuntoHistorial[] {
  return sesiones
    .filter((s) => s.estado === 'finalizada')
    .map((s) => {
      const e = s.ejercicios.find((x) => x.ranuraId === ranuraId);
      return e ? { fecha: s.fecha, series: e.series } : null;
    })
    .filter((x): x is PuntoHistorial => x !== null)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}
