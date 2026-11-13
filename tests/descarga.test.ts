import { describe, expect, it } from 'vitest';
import { descarga } from '../src/lib/descarga';
import { sumarDias } from '../src/lib/plan-jeik';
import type { Sesion, SerieReg } from '../src/lib/types';

const HOY = '2026-11-13';

interface Opc {
  energia?: number;
  sueno?: number;
  fallos?: number;
  peso?: (i: number) => number;
}

// Una sesión cada 3 días hacia atrás, con 4 ejercicios de 3 series.
function historia(n: number, o: (i: number, fecha: string) => Opc = () => ({})): Sesion[] {
  return Array.from({ length: n }, (_, k) => {
    const i = n - 1 - k;
    const fecha = sumarDias(HOY, -3 * k);
    const { energia = 4, sueno = 8, fallos = 0, peso = (j: number) => 40 + j } = o(i, fecha);
    return {
      fecha,
      estado: 'finalizada',
      energia,
      suenoH: sueno,
      ejercicios: ['a', 'b', 'c', 'd'].map((id, e) => ({
        ranuraId: id,
        nombre: id.toUpperCase(),
        series: Array.from({ length: 3 }, (_, x) => ({ peso: peso(i) + e, reps: 8, estado: e * 3 + x < fallos ? 'fallo' : 'completada' }) as SerieReg),
      })),
    } as unknown as Sesion;
  });
}

const reciente = (fecha: string) => fecha >= sumarDias(HOY, -13);

describe('aviso de descarga', () => {
  it('sin señales no avisa', () => {
    const d = descarga(historia(22), HOY);
    expect(d.senales).toEqual([]);
    expect(d.toca).toBe(false);
  });

  it('una señal sola no basta', () => {
    const d = descarga(historia(22, (_, f) => (reciente(f) ? { energia: 3 } : {})), HOY);
    expect(d.senales).toEqual(['cansancio']);
    expect(d.toca).toBe(false);
  });

  it('cansancio y más fallos de lo normal: toca semana suave', () => {
    const d = descarga(historia(22, (_, f) => (reciente(f) ? { sueno: 7, fallos: 3 } : {})), HOY);
    expect(d.senales).toEqual(['cansancio', 'fallos']);
    expect(d.baja).toEqual({ energia: false, sueno: true });
    expect(d.toca).toBe(true);
  });

  it('estancado: las 3 últimas sesiones no superan a las 3 anteriores', () => {
    const plano = historia(22, (i) => ({ peso: () => 40 + Math.min(i, 15) }));
    const d = descarga(plano, HOY);
    expect(d.estancados).toEqual(['A', 'B', 'C', 'D']);
    expect(d.senales).toEqual(['estancado']);
  });

  it('los borradores y lo de después de hoy no cuentan; con poca historia no juzga', () => {
    const ses = historia(22, (_, f) => (reciente(f) ? { energia: 2, fallos: 6 } : {})).map((s) => (reciente(s.fecha) ? { ...s, estado: 'borrador' } : s)) as Sesion[];
    expect(descarga(ses, HOY).toca).toBe(false);
    expect(descarga(historia(3, () => ({ energia: 1, fallos: 12 })), HOY).senales).toEqual([]);
  });
});
