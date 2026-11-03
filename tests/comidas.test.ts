import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('idb-keyval', () => {
  const store = new Map<string, unknown>();
  return {
    get: async (k: string) => store.get(k),
    set: async (k: string, v: unknown) => void store.set(k, v),
    del: async (k: string) => void store.delete(k),
    clear: async () => store.clear(),
    _store: store,
  };
});

import * as idb from 'idb-keyval';
import {
  ALIMENTOS,
  OPCIONES,
  PLATO_DEF,
  gramos,
  infoComida,
  platoMacros,
  platoNombre,
  resumenComidas,
  totalesDia,
} from '../src/lib/comidas';
import { anotarPeso, exportarBackup, fijarPerfil, getComidas, getMediciones, importarBackup, initDB, patchComidas, resetDB } from '../src/lib/db';
import { deposito, enNavidad, fase, lunesDe, metaGym, semanaDe, semanaN } from '../src/lib/plan-jeik';

const store = (idb as unknown as { _store: Map<string, unknown> })._store;
beforeEach(() => store.clear());

describe('plato', () => {
  it('la proteína y los hidratos salen del objetivo del plato, redondeados a 10 g', () => {
    expect(gramos('prot', ALIMENTOS.prot[0], 'comida')).toBe(210);
    expect(gramos('carb', ALIMENTOS.carb[0], 'comida')).toBe(120);
    expect(gramos('carb', ALIMENTOS.carb[0], 'cena')).toBe(80);
  });

  it('verdura y grasa van en cantidad fija', () => {
    expect(gramos('verd', ALIMENTOS.verd[0], 'cena')).toBe(200);
    expect(gramos('gras', ALIMENTOS.gras[0], 'comida')).toBe(10);
  });

  // Sin pan ni fruta se queda en ~790 kcal: el bloque de 900 deja margen para eso.
  it('el plato por defecto de comida llega a la proteína del bloque', () => {
    const m = platoMacros(PLATO_DEF, 'comida');
    expect(Math.round(m.kcal)).toBe(791);
    expect(m.p).toBeGreaterThanOrEqual(60);
  });

  it('nombra el plato por su proteína y su hidrato', () => {
    expect(platoNombre({ ...PLATO_DEF, prot: 'merluza', carb: 'patata' })).toBe('Merluza o pescado blanco con patata');
  });
});

describe('comidas del día', () => {
  it('cada opción del plan ronda las calorías de su bloque', () => {
    const kcal = { desayuno: 250, comida: 900, cena: 750 };
    for (const [b, ops] of Object.entries(OPCIONES)) {
      for (const o of ops) expect(Math.abs(o.kcal - kcal[b as keyof typeof kcal]), o.id).toBeLessThanOrEqual(100);
    }
  });

  it('suma el plan y los snacks; lo escrito a mano no suma pero se cuenta', () => {
    const t = totalesDia({
      desayuno: { tipo: 'opcion', id: 'd1' },
      comida: { tipo: 'otra', texto: 'menú del día' },
      cena: { tipo: 'salto' },
      snack: [{ t: 'Yogur o skyr', kcal: 110, p: 12 }, { t: 'unas patatas' }],
    });
    expect(t).toEqual({ kcal: 350, p: 30, otras: 1 });
  });

  it('describe cada tipo de registro', () => {
    expect(infoComida('cena', { tipo: 'plato', sel: PLATO_DEF })?.texto).toBe('Tu plato: Pechuga de pollo con arroz');
    expect(infoComida('comida', { tipo: 'salto' })?.clase).toBe('salto');
    expect(infoComida('comida', undefined)).toBeNull();
    expect(infoComida('desayuno', { tipo: 'opcion', id: 'no-existe' })).toBeNull();
  });

  it('resume la semana: del plan, otra cosa, saltadas y snacks', () => {
    const r = resumenComidas(
      {
        '2026-11-02': { desayuno: { tipo: 'opcion', id: 'd2' }, comida: { tipo: 'plato', sel: PLATO_DEF }, snack: [{ t: 'fruta' }] },
        '2026-11-03': { cena: { tipo: 'otra', texto: 'pizza' }, desayuno: { tipo: 'salto' } },
        '2026-11-10': { cena: { tipo: 'otra', texto: 'fuera de la semana' } },
      },
      semanaDe('2026-11-04'),
    );
    expect(r).toEqual({ plan: 2, otra: 1, salto: 1, snacks: 1 });
  });
});

describe('calendario del plan', () => {
  it('cuenta semanas desde el lunes 2 de noviembre', () => {
    expect(lunesDe('2026-11-08')).toBe('2026-11-02');
    expect(semanaN('2026-11-03')).toBe(1);
    expect(semanaN('2026-11-09')).toBe(2);
    expect(semanaN('2026-10-28')).toBe(1);
  });

  it('fases y depósito por semana', () => {
    expect([fase(1), fase(5), fase(19)]).toEqual(['Volver', 'Construir', 'Afinar']);
    expect([deposito(1), deposito(3), deposito(4)]).toEqual(['3', '2', '0–1']);
  });

  it('en Navidad la meta baja a 2 días de gimnasio', () => {
    expect(enNavidad('2026-12-20')).toBe(false);
    expect(enNavidad('2026-12-24')).toBe(true);
    expect(enNavidad('2027-01-10')).toBe(true);
    expect(enNavidad('2027-01-11')).toBe(false);
    expect(metaGym('2026-12-24')).toBe(2);
    expect(metaGym('2026-11-04')).toBe(3);
  });
});

describe('guardado', () => {
  it('las comidas viven en el perfil y un día vacío desaparece', async () => {
    await initDB();
    await fijarPerfil('jeik');
    await patchComidas('2026-11-03', (d) => ({ ...d, desayuno: { tipo: 'opcion', id: 'd1' } }));
    expect((store.get('jeik:comidas') as object)).toEqual({ '2026-11-03': { desayuno: { tipo: 'opcion', id: 'd1' } } });
    await patchComidas('2026-11-03', (d) => {
      delete d.desayuno;
      return d;
    });
    expect(await getComidas()).toEqual({});
  });

  it('el peso del día se sustituye, no se duplica', async () => {
    await initDB();
    await fijarPerfil('jeik');
    await anotarPeso('2026-11-03', 74.6);
    await anotarPeso('2026-11-03', 74.4);
    expect((await getMediciones()).peso).toEqual([{ fecha: '2026-11-03', kg: 74.4 }]);
    await anotarPeso('2026-11-03', null);
    expect((await getMediciones()).peso).toEqual([]);
  });

  it('el backup lleva las comidas y el import las devuelve', async () => {
    await initDB();
    await fijarPerfil('jeik');
    await patchComidas('2026-11-03', () => ({ snack: [{ t: 'fruta', kcal: 80, p: 1 }] }));
    const b = await exportarBackup();
    expect(b.comidas).toEqual({ '2026-11-03': { snack: [{ t: 'fruta', kcal: 80, p: 1 }] } });
    await resetDB();
    expect(await getComidas()).toEqual({});
    await importarBackup(b);
    expect(await getComidas()).toEqual(b.comidas);
  });

  it('un backup viejo sin comidas deja el diario vacío', async () => {
    await initDB();
    await fijarPerfil('jeik');
    await patchComidas('2026-11-03', () => ({ cena: { tipo: 'salto' } }));
    const { comidas: _sin, ...viejo } = await exportarBackup();
    await importarBackup(viejo);
    expect(await getComidas()).toEqual({});
  });
});
