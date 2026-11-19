import { describe, expect, it } from 'vitest';
import { perfil } from '../src/lib/perfiles';
import { CONFIG_YASMINA, RUTINA_YASMINA } from '../src/lib/seed';

const rueda = RUTINA_YASMINA.dias.filter((d) => !d.fueraDeRueda);
const ejercicios = rueda.flatMap((d) => d.ejercicios);

describe('rutina de Yasmina: 4 días, 2 de torso y 2 de pierna', () => {
  it('es una rutina nueva, con objetivo de 4 a la semana', () => {
    expect(RUTINA_YASMINA.id).toBe('rutina-yasmina-4dias');
    expect(CONFIG_YASMINA.entrenosObjetivoSemana).toBe(4);
  });

  it('torso y pierna alternos, y el cardio suelto se llama Cardio', () => {
    expect(rueda.map((d) => d.id)).toEqual(['yta', 'ypa', 'ytb', 'ypb']);
    const sueltos = RUTINA_YASMINA.dias.filter((d) => d.fueraDeRueda);
    expect(sueltos.map((d) => [d.id, d.nombre])).toEqual([['ysuave', 'Cardio']]);
  });

  it('cada día, 6 ejercicios y 18 series', () => {
    for (const d of rueda) {
      expect(d.ejercicios, d.nombre).toHaveLength(6);
      expect(d.ejercicios.reduce((n, e) => n + e.series, 0), d.nombre).toBe(18);
    }
  });

  it('hip thrust una sola vez por semana', () => {
    expect(ejercicios.filter((e) => e.ejercicioId === 'hip-thrust')).toHaveLength(1);
  });

  it('nada por encima de la cabeza ni fondos, por el hombro', () => {
    const fuera = ['press-militar-mancuerna', 'press-hombro-maquina', 'fondos-paralelas'];
    expect(ejercicios.filter((e) => fuera.includes(e.ejercicioId ?? ''))).toEqual([]);
  });

  it('lo que ya hacía sigue con su historial', () => {
    const ranuras = new Set(ejercicios.map((e) => e.ranuraId));
    for (const id of ['yd1-hipthrust', 'yd1-prensa', 'yd2-press', 'yd2-jalon', 'yd2-remo', 'yd1-femoral', 'yd1-gluteo', 'y-laterales', 'y-facepull', 'y-curl', 'y-triceps', 'y-extension', 'y-hiperextension', 'y-pecdeck', 'y-remo-polea', 'yd3-deadbug', 'yd3-plancha']) {
      expect(ranuras.has(id), id).toBe(true);
    }
  });

  it('marca serie a serie (✓ / ✗), así que lo que lleva peso sube por doble progresión', () => {
    expect(perfil('yasmina').porSerie).toBe(true);
    for (const e of ejercicios.filter((x) => x.incrementoKg != null)) {
      expect(e.tipoProgresion, e.nombre).toBe('doble');
      expect(Array.isArray(e.repsObjetivo), e.nombre).toBe(true);
    }
  });
});
