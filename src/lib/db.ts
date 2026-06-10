import { get, set } from 'idb-keyval';
import type { BackupV1, Config, DiaDef, DiaRegistro, EjercicioDef, Mediciones, Rutina, Sesion } from './types';
import { CONFIG_INICIAL, RUTINA_1 } from './seed';

const K = {
  config: 'config',
  rutinas: 'rutinas',
  sesiones: 'sesiones',
  mediciones: 'mediciones',
  diario: 'diario',
} as const;

const MEDICIONES_VACIAS: Mediciones = { peso: [], cintura: [] };

export async function initDB(): Promise<void> {
  if (!(await get(K.config))) await set(K.config, CONFIG_INICIAL);
  if (!(await get(K.rutinas))) await set(K.rutinas, [RUTINA_1]);
  if (!(await get(K.sesiones))) await set(K.sesiones, []);
  if (!(await get(K.mediciones))) await set(K.mediciones, MEDICIONES_VACIAS);
  if (!(await get(K.diario))) await set(K.diario, {});
}

export const getConfig = () => get(K.config) as Promise<Config>;
export const setConfig = (c: Config) => set(K.config, c);
export const getRutinas = () => get(K.rutinas) as Promise<Rutina[]>;
export const getSesiones = () => get(K.sesiones) as Promise<Sesion[]>;
export const getMediciones = () => get(K.mediciones) as Promise<Mediciones>;
export const getDiario = () => get(K.diario) as Promise<Record<string, DiaRegistro>>;

export async function patchDia(fecha: string, patch: Partial<DiaRegistro>): Promise<Record<string, DiaRegistro>> {
  const diario = await getDiario();
  diario[fecha] = { ...diario[fecha], ...patch };
  await set(K.diario, diario);
  return diario;
}

export function hoyISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

export function siguienteDia(rutina: Rutina, diaId: string): DiaDef {
  const i = rutina.dias.findIndex((d) => d.id === diaId);
  return rutina.dias[(i + 1) % rutina.dias.length];
}

export function contarDescansos(
  sesiones: Sesion[],
  diario: Record<string, DiaRegistro>,
  fechaInicioPlan: string,
  hoy: Date = new Date(),
): number {
  const finalizadas = new Set(sesiones.filter((s) => s.estado === 'finalizada').map((s) => s.fecha));
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const hoyStr = hoyISO(hoy);
  let descansos = 0;
  for (const d = new Date(lunes); hoyISO(d) <= hoyStr; d.setDate(d.getDate() + 1)) {
    const iso = hoyISO(d);
    if (iso < fechaInicioPlan || finalizadas.has(iso)) continue;
    if (iso === hoyStr) {
      if (diario[iso]?.descanso) descansos++;
    } else {
      descansos++;
    }
  }
  return descansos;
}

export function diaSugerido(config: Config, rutina: Rutina): DiaDef {
  const ultimo = config.puntero.ultimoDiaCompletadoId;
  const i = ultimo ? rutina.dias.findIndex((d) => d.id === ultimo) : -1;
  return rutina.dias[(i + 1) % rutina.dias.length];
}

export function formatObjetivo(e: EjercicioDef): string {
  if (e.repsObjetivo == null) {
    return e.tipoProgresion === 'tiempo' ? `${e.series}×seg` : `${e.series} series`;
  }
  const reps = Array.isArray(e.repsObjetivo) ? `${e.repsObjetivo[0]}-${e.repsObjetivo[1]}` : `${e.repsObjetivo}`;
  return `${e.series}×${reps}`;
}

export async function exportarBackup(): Promise<BackupV1> {
  const [config, rutinas, sesiones, mediciones, diario] = await Promise.all([
    getConfig(),
    getRutinas(),
    getSesiones(),
    getMediciones(),
    getDiario(),
  ]);
  const exportadoISO = new Date().toISOString();
  const configActualizada = { ...config, ultimoExportISO: exportadoISO };
  await setConfig(configActualizada);
  return { version: 1, app: 'gym', exportadoISO, config: configActualizada, rutinas, sesiones, mediciones, diario };
}

export async function importarBackup(data: unknown): Promise<void> {
  const b = data as BackupV1;
  if (!b || b.app !== 'gym' || b.version !== 1 || !b.config || !Array.isArray(b.rutinas)) {
    throw new Error('El archivo no parece un backup válido de GYM');
  }
  await Promise.all([
    set(K.config, b.config),
    set(K.rutinas, b.rutinas),
    set(K.sesiones, b.sesiones ?? []),
    set(K.mediciones, b.mediciones ?? MEDICIONES_VACIAS),
    set(K.diario, b.diario ?? {}),
  ]);
}
