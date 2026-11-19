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
import { getSesiones, initDB, setPerfilActivo, setSesiones } from '../src/lib/db';
import { cerrarBorradoresCaducados } from '../src/lib/sesion';
import type { Sesion, SerieReg } from '../src/lib/types';

const store = (idb as unknown as { _store: Map<string, unknown> })._store;
beforeEach(async () => {
  store.clear();
  await initDB();
  await setPerfilActivo('jeik');
});

const hace = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const borrador = (series: SerieReg[]): Sesion => ({
  id: crypto.randomUUID(),
  fecha: hace(3).slice(0, 10),
  inicioISO: hace(3),
  finISO: hace(3),
  empezadaISO: hace(3),
  terminadaISO: null,
  rutinaId: 'rutina-jeik-b1',
  diaId: 'jcardio',
  estado: 'borrador',
  suenoH: null,
  energia: null,
  duracionMin: null,
  notas: '',
  ejercicios: [{ ranuraId: 'j-cardio-cinta', nombre: 'Cinta inclinada', series }],
});

describe('borradores caducados', () => {
  it('sin ninguna serie marcada se borran, aunque llegaran a arrancar el crono', async () => {
    await setSesiones([borrador([{ peso: null, reps: null, segundos: null, estado: 'pendiente' }])]);
    await cerrarBorradoresCaducados();
    expect(await getSesiones()).toEqual([]);
  });

  it('con algo marcado se finalizan como siempre', async () => {
    await setSesiones([borrador([{ peso: null, reps: null, segundos: 1800, estado: 'completada' }])]);
    await cerrarBorradoresCaducados();
    const [s] = await getSesiones();
    expect(s.estado).toBe('finalizada');
  });
});
