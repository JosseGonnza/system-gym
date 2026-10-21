import { describe, expect, it } from 'vitest';
import {
  arrancarCrono,
  camposDe,
  esCardio,
  maquinaPorDefecto,
  pararCrono,
  precargar,
  segundosCrono,
  ultimoCardio,
} from '../src/lib/cardio';
import type { DatosCardio, SerieReg, Sesion } from '../src/lib/types';

const sesion = (fecha: string, ranuraId: string, serie: Partial<SerieReg>, estado: Sesion['estado'] = 'finalizada'): Sesion => ({
  id: `${fecha}-${ranuraId}`,
  fecha,
  inicioISO: `${fecha}T18:00:00.000Z`,
  finISO: null,
  rutinaId: 'rutina-arnold',
  diaId: 'cardio',
  estado,
  suenoH: null,
  energia: null,
  duracionMin: null,
  notas: '',
  ejercicios: [{ ranuraId, nombre: ranuraId, series: [{ peso: null, reps: null, estado: 'completada', ...serie }] }],
});

describe('máquinas de cardio', () => {
  it('cada máquina enseña sus campos', () => {
    expect(camposDe('cardio-cinta')).toEqual(['velocidad', 'inclinacion', 'distanciaKm', 'pulso']);
    expect(camposDe('cardio-bici')).toContain('rpm');
    expect(camposDe('cardio-eliptica')).not.toContain('inclinacion');
  });

  it('una máquina desconocida no rompe: distancia y pulso', () => {
    expect(esCardio('press-banca')).toBe(false);
    expect(camposDe(undefined)).toEqual(['distanciaKm', 'pulso']);
  });
});

describe('arrancar con lo del último día', () => {
  const ultimo: DatosCardio = { objetivoMin: 40, velocidad: 6.5, inclinacion: 8, distanciaKm: 4.2, pulso: 132, esfuerzo: 7 };

  it('precarga objetivo y ajustes de la máquina, no los resultados', () => {
    expect(precargar(ultimo)).toEqual({ objetivoMin: 40, velocidad: 6.5, inclinacion: 8 });
  });

  it('sin historial: objetivo de 30 min', () => {
    expect(precargar(null)).toEqual({ objetivoMin: 30 });
  });

  it('coge la última sesión finalizada de esa máquina', () => {
    const sesiones = [
      sesion('2026-10-01', 'cardio-cinta', { cardio: { velocidad: 5 } }),
      sesion('2026-10-10', 'cardio-cinta', { cardio: { velocidad: 6 } }),
      sesion('2026-10-12', 'cardio-cinta', { cardio: { velocidad: 9 } }, 'borrador'),
      sesion('2026-10-15', 'cardio-bici', { cardio: { nivel: 8 } }),
    ];
    expect(ultimoCardio(sesiones, 'cardio-cinta')?.cardio?.velocidad).toBe(6);
    expect(ultimoCardio(sesiones, 'cardio-eliptica')).toBeNull();
  });

  it('abre la máquina del último cardio hecho, o la primera', () => {
    const ids = ['cardio-cinta', 'cardio-eliptica', 'cardio-bici'];
    expect(maquinaPorDefecto([], ids)).toBe('cardio-cinta');
    const sesiones = [
      sesion('2026-10-01', 'cardio-cinta', {}),
      sesion('2026-10-10', 'cardio-bici', {}),
      sesion('2026-10-12', 'cardio-eliptica', { estado: 'pendiente' }),
    ];
    expect(maquinaPorDefecto(sesiones, ids)).toBe('cardio-bici');
  });
});

describe('crono por reloj de pared', () => {
  const t0 = new Date('2026-10-21T18:00:00.000Z');
  const mas = (seg: number) => new Date(t0.getTime() + seg * 1000);

  it('cuenta el tiempo real aunque la página se congele', () => {
    const c: DatosCardio = {};
    arrancarCrono(c, t0);
    expect(segundosCrono(c, mas(1200).getTime())).toBe(1200);
  });

  it('la pausa no cuenta, y al seguir suma lo de antes', () => {
    const c: DatosCardio = {};
    arrancarCrono(c, t0);
    pararCrono(c, mas(600));
    expect(segundosCrono(c, mas(900).getTime())).toBe(600);
    arrancarCrono(c, mas(900));
    expect(segundosCrono(c, mas(1500).getTime())).toBe(1200);
  });

  it('arrancar dos veces no reinicia', () => {
    const c: DatosCardio = {};
    arrancarCrono(c, t0);
    arrancarCrono(c, mas(300));
    expect(segundosCrono(c, mas(600).getTime())).toBe(600);
  });
});
