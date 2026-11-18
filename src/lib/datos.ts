import { pesoReal } from './carga';
import { e1rm } from './fuerza';
import { MUSCULOS, TRABAJA } from './volumen';
import type { BackupV2, EjercicioDef, EstadoSerie, Implemento, Mediciones, Patron, Sensacion } from './types';

export type ResultadoBackup = { ok: true; backup: BackupV2 } | { ok: false; error: string };

export function validarBackup(x: unknown): ResultadoBackup {
  const b = x as Partial<BackupV2> | null;
  if (!b || typeof b !== 'object' || b.app !== 'gym') return { ok: false, error: 'Eso no es un backup de la app GYM.' };
  if ((b.version as number) === 1) return { ok: false, error: 'Es un backup antiguo (v1). Exporta uno nuevo desde Ajustes.' };
  if (b.version !== 2) return { ok: false, error: `Versión de backup desconocida (${String(b.version)}).` };
  if (b.perfil && b.perfil !== 'jose') return { ok: false, error: `Este backup es del perfil «${b.perfil}», no el tuyo.` };
  if (!Array.isArray(b.sesiones) || !Array.isArray(b.rutinas) || !Array.isArray(b.catalogo)) {
    return { ok: false, error: 'Al backup le faltan sesiones, rutinas o catálogo.' };
  }
  return { ok: true, backup: b as BackupV2 };
}

export function pesoCorporalEn(pesos: Mediciones['peso'], fecha: string): number {
  if (!pesos.length) return 0;
  const orden = [...pesos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  let kg = orden[0].kg;
  for (const p of orden) if (p.fecha <= fecha) kg = p.kg;
  return kg;
}

export function semanaISO(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number);
  const dow = (x: Date) => (x.getUTCDay() + 6) % 7;
  // El jueves de esa semana decide el año; la semana 1 es la del 4 de enero.
  const jueves = new Date(Date.UTC(y, m - 1, d));
  jueves.setUTCDate(jueves.getUTCDate() - dow(jueves) + 3);
  const año = jueves.getUTCFullYear();
  const ene4 = new Date(Date.UTC(año, 0, 4));
  const semana = 1 + Math.round(((jueves.getTime() - ene4.getTime()) / 864e5 - 3 + dow(ene4)) / 7);
  return `${año}-S${String(semana).padStart(2, '0')}`;
}

// Ranuras de la Rutina 1 de junio que ya no están en ninguna rutina del backup.
// Dominadas no tiene equivalente en el catálogo: se queda sin ejercicio.
const RANURAS_VIEJAS: Record<string, string> = {
  'd3-muerto': 'peso-muerto',
  'd4-banca-ligero': 'press-banca',
  'd2-laterales': 'elevacion-lateral',
  'd3-facepulls': 'face-pull',
  'd4-triceps': 'extension-triceps-polea',
};

const PATRONES: Record<Patron, string> = {
  empujeH: 'Empuje horizontal',
  empujeV: 'Empuje vertical',
  traccionV: 'Tracción vertical',
  traccionH: 'Tracción horizontal',
  rodilla: 'Rodilla',
  cadera: 'Cadera',
  aislamiento: 'Aislamiento',
  core: 'Core',
  movilidad: 'Movilidad',
  cardio: 'Cardio',
};

const IMPLEMENTOS: Record<Implemento, string> = {
  barra: 'Barra',
  barraZ: 'Barra Z',
  multipower: 'Multipower',
  mancuerna: 'Mancuerna',
  maquina: 'Máquina',
  polea: 'Polea',
  kettlebell: 'Kettlebell',
  corporal: 'Corporal',
};

const SENSACIONES: Record<Sensacion, string> = { facil: 'Fácil', bien: 'Bien', duro: 'Duro' };

const SIN_1RM = new Set(['tiempo', 'pesoCorporal', 'libre']);

export interface FilaSerie {
  id: string;
  sesionId: string;
  fecha: string;
  semana: string;
  rutina: string;
  dia: string;
  ejercicio: string;
  ejercicioId: string | null;
  musculo: string;
  patron: string;
  implemento: string;
  n: number;
  kg: number | null;
  lastre: number | null;
  kgReal: number | null;
  reps: number | null;
  seg: number | null;
  estado: Exclude<EstadoSerie, 'pendiente'>;
  e1rm: number | null;
  tonelaje: number | null;
  sensacion: string;
  molestia: boolean;
  sueno: number | null;
  energia: number | null;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function filasSeries(b: BackupV2): FilaSerie[] {
  const catalogo = new Map(b.catalogo.map((e) => [e.id, e]));
  const porNombre = new Map(b.catalogo.map((e) => [norm(e.nombre), e.id]));
  const ranuras = new Map<string, EjercicioDef>();
  const rutinas = new Map<string, string>();
  const dias = new Map<string, string>();
  for (const r of b.rutinas) {
    rutinas.set(r.id, r.nombre);
    for (const d of r.dias) {
      dias.set(`${r.id}/${d.id}`, d.nombre);
      for (const e of d.ejercicios) if (!ranuras.has(e.ranuraId)) ranuras.set(e.ranuraId, e);
    }
  }
  const musculos = new Map(MUSCULOS.map((m) => [m.id, m.nombre]));
  const pesos = b.mediciones?.peso ?? [];

  const sesiones = b.sesiones
    .filter((s) => s.estado === 'finalizada')
    .sort((a, c) => a.fecha.localeCompare(c.fecha) || (a.inicioISO ?? '').localeCompare(c.inicioISO ?? '') || a.id.localeCompare(c.id));

  const filas: FilaSerie[] = [];
  for (const s of sesiones) {
    const bw = pesoCorporalEn(pesos, s.fecha);
    const semana = semanaISO(s.fecha);
    s.ejercicios.forEach((e, ie) => {
      const def = ranuras.get(e.ranuraId);
      const ejId = def?.ejercicioId ?? RANURAS_VIEJAS[e.ranuraId] ?? porNombre.get(norm(e.nombre)) ?? null;
      const ej = ejId ? catalogo.get(ejId) : undefined;
      const conCarga = ej ? ['porLado', 'porMancuerna', 'directa'].includes(ej.entrada) : true;
      const con1rm = conCarga && !SIN_1RM.has(def?.tipoProgresion ?? '');
      const trabaja = ej ? TRABAJA[ej.id] : undefined;
      let n = 0;
      e.series.forEach((x, ix) => {
        if (x.estado === 'pendiente') return;
        n++;
        const lastre = x.lastreKg ?? null;
        let real: number | null;
        if (ej) real = ej.entrada === 'ninguna' ? null : pesoReal(ej, x.peso, lastre, bw);
        else real = x.peso != null ? x.peso : lastre != null && bw > 0 ? bw + lastre : null;
        if (real != null) real = r2(real);
        const sinLastre = ej ? true : x.peso != null && lastre == null;
        const est = real != null && x.reps != null && con1rm && sinLastre ? e1rm(real, x.reps) : null;
        filas.push({
          id: `${s.id}/${ie}/${ix}`,
          sesionId: s.id,
          fecha: s.fecha,
          semana,
          rutina: rutinas.get(s.rutinaId) ?? s.rutinaId,
          dia: dias.get(`${s.rutinaId}/${s.diaId}`) ?? s.diaId,
          ejercicio: ej?.nombre ?? e.nombre,
          ejercicioId: ej?.id ?? null,
          musculo: trabaja ? (musculos.get(trabaja[0]) ?? '') : ej?.patron === 'cardio' || ej?.id.startsWith('cardio-') ? 'Cardio' : '',
          patron: ej ? PATRONES[ej.patron] : '',
          implemento: ej ? IMPLEMENTOS[ej.implemento] : '',
          n,
          kg: x.peso,
          lastre,
          kgReal: real,
          reps: x.reps,
          seg: x.segundos ?? null,
          estado: x.estado as FilaSerie['estado'],
          e1rm: est != null ? r1(est) : null,
          tonelaje: real != null && x.reps != null ? r1(real * x.reps) : null,
          sensacion: e.sensacion ? SENSACIONES[e.sensacion] : '',
          molestia: e.molestia === true,
          sueno: s.suenoH,
          energia: s.energia,
        });
      });
    });
  }
  return filas;
}
