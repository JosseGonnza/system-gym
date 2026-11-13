import { lunesDe, sumarDias } from './plan-jeik';
import type { Rutina, Sesion } from './types';

export type Musculo = 'pecho' | 'espalda' | 'hombro' | 'biceps' | 'triceps' | 'cuadriceps' | 'femoral' | 'gluteo' | 'gemelo' | 'core';

export const MUSCULOS: { id: Musculo; nombre: string }[] = [
  { id: 'pecho', nombre: 'Pecho' },
  { id: 'espalda', nombre: 'Espalda' },
  { id: 'hombro', nombre: 'Hombro' },
  { id: 'biceps', nombre: 'Bíceps' },
  { id: 'triceps', nombre: 'Tríceps' },
  { id: 'cuadriceps', nombre: 'Cuádriceps' },
  { id: 'femoral', nombre: 'Femoral' },
  { id: 'gluteo', nombre: 'Glúteo' },
  { id: 'gemelo', nombre: 'Gemelo' },
  { id: 'core', nombre: 'Core' },
];

// Series por semana que se dan por buenas para crecer. El core no la lleva.
export const FRANJA: [number, number] = [10, 20];
export const SECUNDARIO = 0.5;

// Principal y secundarios. Va aquí y no en el catálogo: el catálogo guardado
// en el móvil no se reescribe al actualizar la app.
export const TRABAJA: Record<string, [Musculo, Musculo[]]> = {
  'press-banca': ['pecho', ['triceps', 'hombro']],
  'press-banca-maquina': ['pecho', ['triceps', 'hombro']],
  'press-inclinado-mancuerna': ['pecho', ['hombro', 'triceps']],
  'press-inclinado-maquina': ['pecho', ['hombro', 'triceps']],
  'pec-deck': ['pecho', []],
  'fondos-paralelas': ['pecho', ['triceps']],
  'jalon-pecho': ['espalda', ['biceps']],
  'jalon-maquina': ['espalda', ['biceps']],
  'remo-polea': ['espalda', ['biceps']],
  'remo-maquina': ['espalda', ['biceps']],
  'remo-maquina-brazo': ['espalda', ['biceps']],
  'encogimiento-trapecio': ['espalda', []],
  'press-militar-mancuerna': ['hombro', ['triceps']],
  'press-hombro-maquina': ['hombro', ['triceps']],
  'elevacion-lateral': ['hombro', []],
  'elevacion-lateral-polea': ['hombro', []],
  'face-pull': ['hombro', ['espalda']],
  'pajaros-crossover': ['hombro', ['espalda']],
  'pajaros-pec-deck': ['hombro', ['espalda']],
  'curl-z': ['biceps', []],
  'curl-mancuerna': ['biceps', []],
  'curl-polea-cuerda': ['biceps', []],
  'curl-polea-barra': ['biceps', []],
  'extension-triceps-polea': ['triceps', []],
  'prensa-horizontal': ['cuadriceps', ['gluteo']],
  'extension-cuadriceps': ['cuadriceps', []],
  'curl-femoral': ['femoral', []],
  'peso-muerto-rumano': ['femoral', ['gluteo']],
  'rumano-mancuerna': ['femoral', ['gluteo']],
  'peso-muerto': ['gluteo', ['femoral', 'espalda']],
  'hiperextension': ['gluteo', ['femoral']],
  'hip-thrust': ['gluteo', ['femoral']],
  'patada-gluteo': ['gluteo', []],
  'abduccion-cadera': ['gluteo', []],
  'abductor-maquina': ['gluteo', []],
  'gemelo-prensa': ['gemelo', []],
  'gemelo-pie': ['gemelo', []],
  plancha: ['core', []],
  'crunch-polea': ['core', []],
  'crunch-declinado': ['core', []],
  'elevacion-piernas': ['core', []],
  'dead-bug': ['core', []],
  'bird-dog': ['core', []],
};

export type Series = Record<Musculo, number>;

const vacio = (): Series => Object.fromEntries(MUSCULOS.map((m) => [m.id, 0])) as Series;

export function ejercicioPorRanura(rutinas: Rutina[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const r of rutinas) for (const d of r.dias) for (const e of d.ejercicios) if (e.ejercicioId) m.set(e.ranuraId, e.ejercicioId);
  return m;
}

export function seriesSemana(sesiones: Sesion[], ranuras: Map<string, string>, lunes: string): Series {
  const out = vacio();
  const fin = sumarDias(lunes, 6);
  for (const s of sesiones) {
    if (s.estado !== 'finalizada' || s.fecha < lunes || s.fecha > fin) continue;
    for (const e of s.ejercicios) {
      const t = TRABAJA[ranuras.get(e.ranuraId) ?? ''];
      if (!t) continue;
      const n = e.series.filter((x) => x.estado !== 'pendiente').length;
      out[t[0]] += n;
      for (const m of t[1]) out[m] += n * SECUNDARIO;
    }
  }
  return out;
}

export interface FilaVolumen {
  musculo: Musculo;
  nombre: string;
  esta: number;
  media: number;
}

// La semana en curso frente a la media de las 4 anteriores, que ya están cerradas.
export function volumen(sesiones: Sesion[], rutinas: Rutina[], hoy: string): FilaVolumen[] {
  const ranuras = ejercicioPorRanura(rutinas);
  const lunes = lunesDe(hoy);
  const esta = seriesSemana(sesiones, ranuras, lunes);
  const previas = [1, 2, 3, 4].map((w) => seriesSemana(sesiones, ranuras, sumarDias(lunes, -7 * w)));
  return MUSCULOS.map(({ id, nombre }) => ({
    musculo: id,
    nombre,
    esta: esta[id],
    media: previas.reduce((a, s) => a + s[id], 0) / previas.length,
  }));
}
