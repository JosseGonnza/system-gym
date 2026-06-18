import { beforeEach, describe, expect, it, vi } from 'vitest';

// IndexedDB no existe en Node: mockeamos idb-keyval con un Map en memoria.
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
import { initDB, getConfig, setConfig, getPerfilActivo, setPerfilActivo, resetDB, exportarBackup } from '../src/lib/db';
import { horarioDe } from '../src/lib/horarios';
import { dietaDe } from '../src/lib/dietas';

const store = (idb as unknown as { _store: Map<string, unknown> })._store;
const conf = (c: Awaited<ReturnType<typeof getConfig>>) => c;

beforeEach(() => store.clear());

describe('multi-perfil', () => {
  it('instalación nueva arranca en Jose y siembra sus datos + catálogo compartido', async () => {
    await initDB();
    expect(getPerfilActivo()).toBe('jose');
    expect(store.has('jose:config')).toBe(true);
    expect(store.has('jose:rutinas')).toBe(true);
    expect(store.has('catalogo')).toBe(true);
  });

  it('migra datos antiguos sin prefijo al perfil de Jose y borra los viejos', async () => {
    store.set('config', { fechaInicioPlan: '2026-06-10' });
    store.set('sesiones', [{ id: 's1' }]);
    await initDB();
    expect(store.has('config')).toBe(false);
    expect(store.has('sesiones')).toBe(false);
    expect(store.get('jose:sesiones')).toEqual([{ id: 's1' }]);
    expect(getPerfilActivo()).toBe('jose');
  });

  it('no re-migra si ya existe el perfil de Jose', async () => {
    store.set('jose:sesiones', [{ id: 'bueno' }]);
    store.set('config', { fechaInicioPlan: 'x' }); // resto viejo que NO debe pisar
    await initDB();
    expect(store.get('jose:sesiones')).toEqual([{ id: 'bueno' }]);
  });

  it('cada perfil guarda sus datos por separado', async () => {
    await initDB();
    await setConfig(conf({ ...(await getConfig()), entrenosObjetivoSemana: 5 }));
    await setPerfilActivo('yasmina');
    await setConfig(conf({ ...(await getConfig()), entrenosObjetivoSemana: 3 }));
    expect((store.get('jose:config') as { entrenosObjetivoSemana: number }).entrenosObjetivoSemana).toBe(5);
    expect((store.get('yasmina:config') as { entrenosObjetivoSemana: number }).entrenosObjetivoSemana).toBe(3);
  });

  it('el backup lleva el perfil activo', async () => {
    await initDB();
    await setPerfilActivo('yasmina');
    const b = await exportarBackup();
    expect(b.perfil).toBe('yasmina');
    expect(b.version).toBe(2);
  });

  it('cada perfil tiene sus jornadas y toda jornada tiene pauta', () => {
    expect(horarioDe('jose').jornadas.map((j) => j.id)).toEqual(['manana', 'tarde', 'libre']);
    expect(horarioDe('yasmina').jornadas.map((j) => j.id)).toEqual(['laboratorio', 'ett', 'libre']);
    for (const p of ['jose', 'yasmina'] as const) {
      const h = horarioDe(p);
      for (const j of h.jornadas) expect(h.pautas[j.id], `${p}/${j.id}`).toBeDefined();
    }
  });

  it('cada perfil tiene su dieta con 4 macros y platos', () => {
    for (const p of ['jose', 'yasmina'] as const) {
      const d = dietaDe(p);
      expect(d.macros).toHaveLength(4);
      expect(d.platos.length).toBeGreaterThan(0);
      expect(d.resumen.length).toBeGreaterThan(0);
    }
    expect(dietaDe('yasmina').macros[0].valor).toBe('1.825');
  });

  it('reset solo afecta al perfil activo, no al otro ni al catálogo', async () => {
    await initDB();
    await setPerfilActivo('yasmina');
    store.set('jose:sesiones', [{ id: 'jose-no-tocar' }]);
    store.set('yasmina:sesiones', [{ id: 'borrame' }]);
    await resetDB();
    expect(store.get('jose:sesiones')).toEqual([{ id: 'jose-no-tocar' }]);
    expect(store.get('yasmina:sesiones')).toEqual([]);
    expect(store.has('catalogo')).toBe(true);
  });
});
