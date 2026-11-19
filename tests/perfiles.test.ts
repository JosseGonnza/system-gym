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
import { PERFILES, perfil as perfilDe } from '../src/lib/perfiles';
import { CATALOGO, CONFIG_INICIAL, CONFIG_YASMINA, RUTINA_JOSE, RUTINA_YASMINA } from '../src/lib/seed';

describe('jornadas por perfil', () => {
  // Ninguno de los dos las usa ya: entrenan por sensaciones, no por turno.
  // El mecanismo se conserva por si alguna vez vuelve a hacer falta.
  it('nadie usa jornadas ahora mismo', () => {
    expect(perfilDe('jose').usaJornadas).toBe(false);
    expect(perfilDe('yasmina').usaJornadas).toBe(false);
  });

  it('todo perfil declara si usa jornadas', () => {
    for (const p of PERFILES) expect(typeof p.usaJornadas).toBe('boolean');
  });

  it('solo Yasmina va en modo sencillo', () => {
    expect(perfilDe('yasmina').modoSencillo).toBe(true);
    expect(perfilDe('jose').modoSencillo).toBe(false);
  });
});

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

  it('Jose y Yasmina llevan la dieta de casa; Jeik, su diario', () => {
    expect(perfilDe('jose').casa).toBe(true);
    expect(perfilDe('yasmina').casa).toBe(true);
    expect(perfilDe('jeik').casa).toBeFalsy();
    expect(dietaDe('jose')).toBeUndefined();
    expect(dietaDe('yasmina')).toBeUndefined();
  });

  it('la rutina vigente de Yasmina llega sola, activa y sin tocar sus sesiones', async () => {
    const vieja = { id: 'rutina-yasmina', nombre: 'Rueda de 4', dias: [] };
    store.set('perfilActivo', 'yasmina');
    store.set('yasmina:config', { ...CONFIG_YASMINA, rutinaActivaId: 'rutina-yasmina', entrenosObjetivoSemana: 4, puntero: { ultimoDiaCompletadoId: 'yb' } });
    store.set('yasmina:rutinas', [vieja]);
    store.set('yasmina:sesiones', [{ id: 'agosto' }]);
    await initDB();
    const rutinas = store.get('yasmina:rutinas') as { id: string }[];
    expect(rutinas.map((r) => r.id)).toEqual(['rutina-yasmina', RUTINA_YASMINA.id]);
    const config = await getConfig();
    expect(config.rutinaActivaId).toBe(RUTINA_YASMINA.id);
    expect(config.entrenosObjetivoSemana).toBe(4);
    expect(config.puntero.ultimoDiaCompletadoId).toBeNull();
    expect(config.macros.kcal).toBe(1825);
    expect(store.get('yasmina:sesiones')).toEqual([{ id: 'agosto' }]);
  });

  it('la rutina vigente solo se añade una vez y no pisa el puntero después', async () => {
    store.set('perfilActivo', 'yasmina');
    await initDB();
    await setConfig({ ...(await getConfig()), puntero: { ultimoDiaCompletadoId: 'fa' } });
    await initDB();
    expect((store.get('yasmina:rutinas') as unknown[]).length).toBe(1);
    expect((await getConfig()).puntero.ultimoDiaCompletadoId).toBe('fa');
  });

  it('a Jose le llega la rueda de 4 una sola vez: activa, desde el primer día y con objetivo de 4', async () => {
    store.set('jose:rutinas', [{ id: 'rutina-arnold', nombre: 'Arnold', dias: [] }]);
    store.set('jose:config', { ...CONFIG_INICIAL, rutinaActivaId: 'rutina-arnold', puntero: { ultimoDiaCompletadoId: 'b' } });
    await initDB();
    expect((store.get('jose:rutinas') as { id: string }[]).map((r) => r.id)).toEqual(['rutina-arnold', RUTINA_JOSE.id]);
    const config = await getConfig();
    expect([config.rutinaActivaId, config.puntero.ultimoDiaCompletadoId, config.entrenosObjetivoSemana]).toEqual([RUTINA_JOSE.id, null, 4]);
    await setConfig({ ...config, rutinaActivaId: 'rutina-arnold' });
    await initDB();
    expect((await getConfig()).rutinaActivaId).toBe('rutina-arnold');
  });

  it('la rutina guardada se pone al día con la del código, sin perder el descanso ajustado', async () => {
    const vieja = structuredClone(RUTINA_JOSE);
    vieja.dias[0].nombre = 'Coraza · Empuje';
    vieja.dias[0].ejercicios[0].restSeg = 240;
    vieja.dias[0].ejercicios.pop();
    store.set('jose:rutinas', [{ id: 'rutina-arnold', nombre: 'Arnold', dias: [] }, vieja]);
    store.set('jose:config', { ...CONFIG_INICIAL, rutinaActivaId: 'rutina-arnold' });
    await initDB();
    const [, guardada] = store.get('jose:rutinas') as typeof RUTINA_JOSE[];
    expect(guardada.dias[0].nombre).toBe('Empuje');
    expect(guardada.dias[0].ejercicios).toHaveLength(RUTINA_JOSE.dias[0].ejercicios.length);
    expect(guardada.dias[0].ejercicios[0].restSeg).toBe(240);
    expect((await getConfig()).rutinaActivaId).toBe('rutina-arnold');
  });

  it('la rueda nueva de Jose: 4 días en la rueda, cardio aparte, 6-7 ejercicios por día', () => {
    const rueda = RUTINA_JOSE.dias.filter((d) => !d.fueraDeRueda);
    expect(rueda.map((d) => d.nombre)).toEqual(['Empuje', 'Tirón', 'Pierna', 'Bombeo']);
    for (const d of rueda) expect(d.ejercicios.length, d.nombre).toBeGreaterThanOrEqual(6);
    for (const d of rueda) expect(d.ejercicios.length, d.nombre).toBeLessThanOrEqual(7);
    // Una ranura repetida comparte historial: solo vale si es el mismo ejercicio.
    const porRanura = new Map<string, Set<string>>();
    for (const e of RUTINA_JOSE.dias.flatMap((d) => d.ejercicios)) porRanura.set(e.ranuraId, (porRanura.get(e.ranuraId) ?? new Set()).add(e.ejercicioId!));
    for (const [id, ejs] of porRanura) expect(ejs.size, id).toBe(1);
  });

  it('el catálogo recupera los ejercicios que le falten, sin quitar ni cambiar ninguno', async () => {
    const propio = { ...CATALOGO[0], nota: 'nota cambiada en el móvil' };
    const extra = { ...CATALOGO[1], id: 'solo-en-el-movil' };
    store.set('catalogo', [propio, extra]);
    await initDB();
    const cat = store.get('catalogo') as { id: string; nota?: string }[];
    expect(cat).toHaveLength(CATALOGO.length + 1);
    expect(cat.find((e) => e.id === CATALOGO[0].id)?.nota).toBe('nota cambiada en el móvil');
    expect(cat.some((e) => e.id === 'solo-en-el-movil')).toBe(true);
    expect(cat.some((e) => e.id === 'crunch-declinado')).toBe(true);
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
