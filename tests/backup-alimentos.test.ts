import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('idb-keyval', () => {
  const store = new Map<string, unknown>();
  return {
    get: async (k: string) => store.get(k),
    set: async (k: string, v: unknown) => void store.set(k, v),
    del: async (k: string) => void store.delete(k),
    _store: store,
  };
});

import * as idb from 'idb-keyval';
import { getAlimentos, importarBackup, initDB, leerBackup, resetDB, setAlimentos, setPerfilActivo } from '../src/lib/db';
import type { Alimento } from '../src/lib/alimentos';

const store = (idb as unknown as { _store: Map<string, unknown> })._store;
const mio: Alimento = { id: 'propio-batido', nombre: 'Batido', por100: { kcal: 100, prot: 10, hc: 5, grasa: 3 } };

describe('mis alimentos en la base de datos', () => {
  beforeEach(async () => {
    store.clear();
    await initDB();
    await setPerfilActivo('jose');
  });

  it('se guardan por perfil', async () => {
    await setAlimentos([mio]);
    expect(await getAlimentos()).toEqual([mio]);
    await setPerfilActivo('yasmina');
    expect(await getAlimentos()).toEqual([]);
  });

  it('van en el backup y vuelven al importarlo', async () => {
    await setAlimentos([mio]);
    const b = await leerBackup();
    expect(b.alimentos).toEqual([mio]);
    await setAlimentos([]);
    await importarBackup(b);
    expect(await getAlimentos()).toEqual([mio]);
  });

  it('un backup de antes de los alimentos no borra los que ya tienes', async () => {
    await setAlimentos([mio]);
    const { alimentos: _, ...viejo } = await leerBackup();
    await importarBackup(viejo);
    expect(await getAlimentos()).toEqual([mio]);
  });

  it('resetear el perfil los borra', async () => {
    await setAlimentos([mio]);
    await resetDB();
    expect(await getAlimentos()).toEqual([]);
  });
});
