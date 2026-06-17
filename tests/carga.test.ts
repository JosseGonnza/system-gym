import { describe, expect, it } from 'vitest';
import { pesoReal, muestraPesoReal } from '../src/lib/carga';
import { CATALOGO, RUTINA_1 } from '../src/lib/seed';

const ej = (id: string) => {
  const e = CATALOGO.find((x) => x.id === id);
  if (!e) throw new Error(`Falta ${id} en el catálogo`);
  return e;
};

describe('pesoReal', () => {
  it('por lado en barra Z: suma la barra y dobla los discos', () => {
    expect(pesoReal(ej('curl-z'), 3.75)).toBe(14.5); // 7 + 3,75×2
  });

  it('por lado en multipower: base 0 → solo dobla los discos', () => {
    expect(pesoReal(ej('press-banca'), 30)).toBe(60);
  });

  it('por lado en peso muerto: barra de 20 + discos por lado', () => {
    expect(pesoReal(ej('peso-muerto'), 15)).toBe(50); // 20 + 15×2
  });

  it('mancuerna: el peso que apuntas ya es el real', () => {
    expect(pesoReal(ej('press-militar-mancuerna'), 14)).toBe(14);
  });

  it('máquina/polea: directo', () => {
    expect(pesoReal(ej('jalon-pecho'), 45)).toBe(45);
  });

  it('peso nulo devuelve nulo', () => {
    expect(pesoReal(ej('curl-z'), null)).toBeNull();
  });

  it('asistencia resta el peso corporal y no baja de 0', () => {
    const asist = { entrada: 'asistencia' as const, pesoBaseKg: 0 };
    expect(pesoReal(asist, null, 27.5, 68)).toBe(40.5);
    expect(pesoReal(asist, null, 100, 68)).toBe(0);
  });

  it('lastre suma al peso corporal', () => {
    const lastre = { entrada: 'lastre' as const, pesoBaseKg: 0 };
    expect(pesoReal(lastre, null, 10, 68)).toBe(78);
  });
});

describe('muestraPesoReal', () => {
  it('solo cuando el real difiere de lo apuntado', () => {
    expect(muestraPesoReal('porLado')).toBe(true);
    expect(muestraPesoReal('lastre')).toBe(true);
    expect(muestraPesoReal('asistencia')).toBe(true);
    expect(muestraPesoReal('porMancuerna')).toBe(false);
    expect(muestraPesoReal('directa')).toBe(false);
    expect(muestraPesoReal('ninguna')).toBe(false);
  });
});

describe('integridad del catálogo y la rutina', () => {
  it('no hay ids de ejercicio duplicados', () => {
    const ids = CATALOGO.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda ranura de la rutina apunta a un ejercicio existente', () => {
    const ids = new Set(CATALOGO.map((e) => e.id));
    for (const dia of RUTINA_1.dias) {
      for (const r of dia.ejercicios) {
        expect(r.ejercicioId, `${r.ranuraId} sin ejercicioId`).toBeDefined();
        expect(ids.has(r.ejercicioId!), `${r.ranuraId} → ${r.ejercicioId} no existe`).toBe(true);
      }
    }
  });
});
