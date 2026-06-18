import { del, get, set } from 'idb-keyval';
import type { BackupV1, BackupV2, Config, DiaDef, DiaRegistro, Ejercicio, EjercicioDef, Mediciones, PerfilId, Rutina, Sesion } from './types';
import { CATALOGO, CONFIG_INICIAL, CONFIG_YASMINA, RUTINA_1, RUTINA_YASMINA } from './seed';
import { esPerfilValido, PERFIL_POR_DEFECTO } from './perfiles';

// Claves globales (compartidas entre perfiles).
const G = { perfilActivo: 'perfilActivo', catalogo: 'catalogo' } as const;
// Nombres de los datos que viven POR perfil → se guardan con prefijo `${perfil}:`.
const PROPIOS = ['config', 'rutinas', 'sesiones', 'mediciones', 'diario'] as const;

// Datos sembrados por perfil (config + rutina inicial). El catálogo es compartido.
const SEED: Record<PerfilId, { config: Config; rutina: Rutina }> = {
  jose: { config: CONFIG_INICIAL, rutina: RUTINA_1 },
  yasmina: { config: CONFIG_YASMINA, rutina: RUTINA_YASMINA },
};

const MEDICIONES_VACIAS: Mediciones = { peso: [], cintura: [] };

// Perfil activo en memoria; se carga en initDB y se usa para prefijar las claves.
let perfilActivo: PerfilId = PERFIL_POR_DEFECTO;
const pk = (nombre: string) => `${perfilActivo}:${nombre}`;

// Datos antiguos (v2, sin prefijo) → se reasignan al perfil de Jose una sola vez.
async function migrarLegacy(): Promise<void> {
  if ((await get('config')) === undefined || (await get('jose:config')) !== undefined) return;
  for (const n of PROPIOS) {
    const v = await get(n);
    if (v !== undefined) {
      await set(`jose:${n}`, v);
      await del(n);
    }
  }
}

async function sembrarPerfil(p: PerfilId): Promise<void> {
  if (!(await get(`${p}:config`))) await set(`${p}:config`, SEED[p].config);
  if (!(await get(`${p}:rutinas`))) await set(`${p}:rutinas`, [SEED[p].rutina]);
  if (!(await get(`${p}:sesiones`))) await set(`${p}:sesiones`, []);
  if (!(await get(`${p}:mediciones`))) await set(`${p}:mediciones`, MEDICIONES_VACIAS);
  if (!(await get(`${p}:diario`))) await set(`${p}:diario`, {});
}

const espejarLocal = (p: PerfilId) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem('perfilActivo', p);
  } catch {
    /* modo privado o sin storage: el tema cae al de por defecto, sin más */
  }
};

export async function initDB(): Promise<void> {
  await migrarLegacy();
  const guardado = await get(G.perfilActivo);
  // No forzamos elección aquí: si no hay perfil elegido, trabajamos con el de por
  // defecto en memoria y el selector (guard del Layout) se encarga de pedirlo.
  perfilActivo = esPerfilValido(guardado) ? guardado : PERFIL_POR_DEFECTO;
  if (esPerfilValido(guardado)) espejarLocal(guardado);
  if (!(await get(G.catalogo))) await set(G.catalogo, CATALOGO);
  await sembrarPerfil(perfilActivo);
}

export const getPerfilActivo = (): PerfilId => perfilActivo;
export async function setPerfilActivo(p: PerfilId): Promise<void> {
  perfilActivo = p;
  await set(G.perfilActivo, p);
  espejarLocal(p);
  await sembrarPerfil(p);
}

export const getConfig = async (): Promise<Config> => ({ ...SEED[perfilActivo].config, ...(await get(pk('config'))) });
export const setConfig = (c: Config) => set(pk('config'), c);
export const getCatalogo = async (): Promise<Ejercicio[]> => (await get(G.catalogo)) ?? CATALOGO;
export const setCatalogo = (c: Ejercicio[]) => set(G.catalogo, c);
export const getRutinas = () => get(pk('rutinas')) as Promise<Rutina[]>;
export const setRutinas = (r: Rutina[]) => set(pk('rutinas'), r);
export const getSesiones = () => get(pk('sesiones')) as Promise<Sesion[]>;
export const setSesiones = (s: Sesion[]) => set(pk('sesiones'), s);
export const getMediciones = () => get(pk('mediciones')) as Promise<Mediciones>;
export const setMediciones = (m: Mediciones) => set(pk('mediciones'), m);
export const getDiario = () => get(pk('diario')) as Promise<Record<string, DiaRegistro>>;

export async function patchDia(fecha: string, patch: Partial<DiaRegistro>): Promise<Record<string, DiaRegistro>> {
  const diario = await getDiario();
  diario[fecha] = { ...diario[fecha], ...patch };
  await set(pk('diario'), diario);
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

export async function exportarBackup(): Promise<BackupV2> {
  const [config, catalogo, rutinas, sesiones, mediciones, diario] = await Promise.all([
    getConfig(),
    getCatalogo(),
    getRutinas(),
    getSesiones(),
    getMediciones(),
    getDiario(),
  ]);
  const exportadoISO = new Date().toISOString();
  const configActualizada = { ...config, ultimoExportISO: exportadoISO };
  await setConfig(configActualizada);
  return { version: 2, app: 'gym', exportadoISO, perfil: perfilActivo, config: configActualizada, catalogo, rutinas, sesiones, mediciones, diario };
}

// Resetea SOLO el perfil activo (no toca el catálogo compartido ni el otro perfil).
export async function resetDB(): Promise<void> {
  for (const n of PROPIOS) await del(pk(n));
  await sembrarPerfil(perfilActivo);
}

export async function importarBackup(data: unknown): Promise<void> {
  const b = data as (BackupV1 | BackupV2) & { catalogo?: Ejercicio[] };
  if (!b || b.app !== 'gym' || (b.version !== 1 && b.version !== 2) || !b.config || !Array.isArray(b.rutinas)) {
    throw new Error('El archivo no parece un backup válido de GYM');
  }
  // Importa sobre el perfil activo. Los backups v1 no traen catálogo: se siembra el de la app.
  await Promise.all([
    set(pk('config'), b.config),
    set(G.catalogo, Array.isArray(b.catalogo) ? b.catalogo : CATALOGO),
    set(pk('rutinas'), b.rutinas),
    set(pk('sesiones'), b.sesiones ?? []),
    set(pk('mediciones'), b.mediciones ?? MEDICIONES_VACIAS),
    set(pk('diario'), b.diario ?? {}),
  ]);
}
