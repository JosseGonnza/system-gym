import type { Ejercicio } from './types';

// El peso que Jose apunta depende del implemento:
//  - barra/multipower/barra Z: apunta lo de UN lado → real = barra + lado×2
//  - mancuerna: apunta la mancuerna → ya es el peso real por mano
//  - máquina/polea: apunta lo que marca el selector → directo
//  - corporal: el peso real sale del peso corporal ± lastre/asistencia
export function pesoReal(
  ej: Pick<Ejercicio, 'entrada' | 'pesoBaseKg'>,
  peso: number | null,
  lastre: number | null = null,
  pesoCorporalKg = 0,
): number | null {
  switch (ej.entrada) {
    case 'porLado':
      return peso == null ? null : ej.pesoBaseKg + peso * 2;
    case 'porMancuerna':
    case 'directa':
      return peso;
    case 'lastre':
      return pesoCorporalKg > 0 ? pesoCorporalKg + (lastre ?? 0) : null;
    case 'asistencia':
      return pesoCorporalKg > 0 ? Math.max(0, pesoCorporalKg - (lastre ?? 0)) : null;
    case 'ninguna':
      return pesoCorporalKg > 0 ? pesoCorporalKg : null;
  }
}

// Solo merece enseñar el "real" cuando difiere de lo que apuntas:
// por lado (suma barra y dobla) o corporal (suma/resta tu peso).
export function muestraPesoReal(entrada: Ejercicio['entrada']): boolean {
  return entrada === 'porLado' || entrada === 'lastre' || entrada === 'asistencia';
}

export function fmtKg(n: number): string {
  return n.toLocaleString('es-ES', { maximumFractionDigits: 2 });
}
