import type { DatosCardio, SerieReg, Sesion } from './types';

export type CampoCardio = 'velocidad' | 'inclinacion' | 'nivel' | 'rpm' | 'distanciaKm' | 'pulso';

export const CAMPOS: Record<CampoCardio, { label: string; unidad: string; step: string }> = {
  velocidad: { label: 'Velocidad', unidad: 'km/h', step: '0.1' },
  inclinacion: { label: 'Inclinación', unidad: '%', step: '0.5' },
  nivel: { label: 'Nivel', unidad: '', step: '1' },
  rpm: { label: 'Cadencia', unidad: 'rpm', step: '1' },
  distanciaKm: { label: 'Distancia', unidad: 'km', step: '0.01' },
  pulso: { label: 'Pulso medio', unidad: 'ppm', step: '1' },
};

// Lo que enseña cada máquina. Vive en el código, como los tips: se amplía con un
// deploy y no hay que regenerar backups.
const POR_MAQUINA: Record<string, CampoCardio[]> = {
  'cardio-cinta': ['velocidad', 'inclinacion', 'distanciaKm', 'pulso'],
  'cardio-eliptica': ['nivel', 'distanciaKm', 'pulso'],
  'cardio-bici': ['nivel', 'rpm', 'distanciaKm', 'pulso'],
  'cardio-caminar': ['distanciaKm', 'pulso'],
};

// Lo que se ajusta en la máquina se precarga del último día. Distancia y pulso
// son resultado: se enseñan como referencia, no se rellenan.
const AJUSTES: CampoCardio[] = ['velocidad', 'inclinacion', 'nivel', 'rpm'];

export const OBJETIVOS_MIN = [20, 30, 40];
const OBJETIVO_POR_DEFECTO = 30;

export function esCardio(ejercicioId?: string): boolean {
  return !!ejercicioId && ejercicioId in POR_MAQUINA;
}

export function camposDe(ejercicioId?: string): CampoCardio[] {
  return (ejercicioId && POR_MAQUINA[ejercicioId]) || ['distanciaKm', 'pulso'];
}

export function ultimoCardio(sesiones: Sesion[], ranuraId: string): SerieReg | null {
  const finalizadas = sesiones
    .filter((s) => s.estado === 'finalizada')
    .sort((a, b) => (b.inicioISO ?? b.fecha).localeCompare(a.inicioISO ?? a.fecha));
  for (const s of finalizadas) {
    const serie = s.ejercicios
      .find((e) => e.ranuraId === ranuraId)
      ?.series.find((x) => x.estado !== 'pendiente' && x.cardio);
    if (serie) return serie;
  }
  return null;
}

export function precargar(ultimo: DatosCardio | null): DatosCardio {
  const datos: DatosCardio = { objetivoMin: ultimo?.objetivoMin ?? OBJETIVO_POR_DEFECTO };
  for (const c of AJUSTES) if (ultimo?.[c] != null) datos[c] = ultimo[c];
  return datos;
}

// La máquina que se abre por defecto: la del último cardio hecho, o la primera.
export function maquinaPorDefecto(sesiones: Sesion[], ranuraIds: string[]): string {
  const finalizadas = sesiones
    .filter((s) => s.estado === 'finalizada')
    .sort((a, b) => (b.inicioISO ?? b.fecha).localeCompare(a.inicioISO ?? a.fecha));
  for (const s of finalizadas) {
    const hecha = s.ejercicios.find(
      (e) => ranuraIds.includes(e.ranuraId) && e.series.some((x) => x.estado !== 'pendiente'),
    );
    if (hecha) return hecha.ranuraId;
  }
  return ranuraIds[0];
}

export function segundosCrono(c: DatosCardio, ahoraMs = Date.now()): number {
  const acum = c.cronoAcumSeg ?? 0;
  if (!c.cronoInicioISO) return acum;
  return acum + Math.max(0, (ahoraMs - Date.parse(c.cronoInicioISO)) / 1000);
}

export function arrancarCrono(c: DatosCardio, ahora = new Date()): void {
  if (!c.cronoInicioISO) c.cronoInicioISO = ahora.toISOString();
}

export function pararCrono(c: DatosCardio, ahora = new Date()): void {
  c.cronoAcumSeg = segundosCrono(c, ahora.getTime());
  c.cronoInicioISO = null;
}
