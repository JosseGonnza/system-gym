import { getConfig, setConfig, getSesiones, setSesiones, hoyISO } from './db';
import type { DiaDef, Rutina, Sesion } from './types';
import type { Sugerencia } from './motor';

const CADUCIDAD_MS = 2 * 3600_000;

export function crearSesion(rutina: Rutina, dia: DiaDef, sugerencias: Map<string, Sugerencia>): Sesion {
  return {
    id: crypto.randomUUID(),
    fecha: hoyISO(),
    inicioISO: null,
    finISO: null,
    rutinaId: rutina.id,
    diaId: dia.id,
    estado: 'borrador',
    suenoH: null,
    energia: null,
    duracionMin: null,
    notas: '',
    ejercicios: dia.ejercicios.map((e) => {
      const sug = sugerencias.get(e.ranuraId);
      return {
        ranuraId: e.ranuraId,
        nombre: e.nombre,
        series: Array.from({ length: e.series }, () => ({
          peso: sug?.peso ?? null,
          reps: sug?.reps ?? null,
          segundos: sug?.segundos ?? null,
          lastreKg: sug?.lastreKg ?? null,
          estado: 'pendiente' as const,
        })),
      };
    }),
  };
}

export async function guardarSesion(sesion: Sesion): Promise<void> {
  const sesiones = await getSesiones();
  const i = sesiones.findIndex((s) => s.id === sesion.id);
  if (i >= 0) sesiones[i] = sesion;
  else sesiones.push(sesion);
  await setSesiones(sesiones);
}

export async function descartarSesion(id: string): Promise<void> {
  await setSesiones((await getSesiones()).filter((s) => s.id !== id));
}

export async function finalizarSesion(sesion: Sesion): Promise<void> {
  sesion.estado = 'finalizada';
  sesion.finISO = sesion.finISO ?? new Date().toISOString();
  sesion.duracionMin = sesion.inicioISO
    ? Math.max(1, Math.round((Date.parse(sesion.finISO) - Date.parse(sesion.inicioISO)) / 60_000))
    : null;
  await guardarSesion(sesion);
  const config = await getConfig();
  await setConfig({ ...config, puntero: { ultimoDiaCompletadoId: sesion.diaId } });
}

export async function buscarBorrador(): Promise<Sesion | undefined> {
  return (await getSesiones()).find((s) => s.estado === 'borrador');
}

// Borradores con +2h sin actividad se finalizan solos (la última serie hace de fin);
// los borradores de días pasados sin ninguna serie marcada se eliminan.
export async function cerrarBorradoresCaducados(): Promise<void> {
  const sesiones = await getSesiones();
  const hoy = hoyISO();
  for (const s of [...sesiones]) {
    if (s.estado !== 'borrador') continue;
    if (!s.finISO) {
      if (s.fecha < hoy) await descartarSesion(s.id);
      continue;
    }
    if (Date.now() - Date.parse(s.finISO) > CADUCIDAD_MS) {
      await finalizarSesion(s);
    }
  }
}
