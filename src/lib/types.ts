export type TipoProgresion = 'lineal' | 'doble' | 'pesoCorporal' | 'tiempo' | 'libre';
export type EstadoSerie = 'pendiente' | 'completada' | 'fallo' | 'corta';
export type EstadoSesion = 'finalizada' | 'borrador';
export type Jornada = 'manana' | 'tarde' | 'libre';

export interface DiaRegistro {
  jornada?: Jornada;
  descanso?: boolean;
  diaElegidoId?: string;
}

export interface EjercicioDef {
  ranuraId: string;
  nombre: string;
  tipoProgresion: TipoProgresion;
  series: number;
  repsObjetivo: number | [number, number] | null;
  incrementoKg: number | null;
  restSeg: number;
  superserieId?: string;
  nota?: string;
}

export interface DiaDef {
  id: string;
  nombre: string;
  emoji: string;
  ejercicios: EjercicioDef[];
}

export interface Rutina {
  id: string;
  nombre: string;
  dias: DiaDef[];
}

export interface Config {
  rutinaActivaId: string;
  fechaInicioPlan: string;
  macros: { kcal: number; prot: number; grasa: number; carbo: number };
  puntero: { ultimoDiaCompletadoId: string | null };
  incrementoMinimoKg: number;
  entrenosObjetivoSemana: number;
  restTimerActivo: boolean;
  ultimoExportISO: string | null;
}

export interface SerieReg {
  peso: number | null;
  reps: number | null;
  segundos?: number | null;
  lastreKg?: number | null;
  estado: EstadoSerie;
}

export interface EjercicioReg {
  ranuraId: string;
  nombre: string;
  series: SerieReg[];
}

export interface Sesion {
  id: string;
  fecha: string;
  inicioISO: string | null;
  finISO: string | null;
  rutinaId: string;
  diaId: string;
  estado: EstadoSesion;
  suenoH: number | null;
  energia: number | null;
  duracionMin: number | null;
  ejercicios: EjercicioReg[];
  notas: string;
}

export interface Mediciones {
  peso: { fecha: string; kg: number }[];
  cintura: { fecha: string; cm: number }[];
}

export interface BackupV1 {
  version: 1;
  app: 'gym';
  exportadoISO: string;
  config: Config;
  rutinas: Rutina[];
  sesiones: Sesion[];
  mediciones: Mediciones;
  diario: Record<string, DiaRegistro>;
}
