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
import { fijarPerfil, getConfig, getPerfilActivo, getRutinas, initDB, siguienteDia } from '../src/lib/db';
import { dietaDe } from '../src/lib/dietas';
import { horarioDe } from '../src/lib/horarios';
import { perfil, PERFILES } from '../src/lib/perfiles';
import { CATALOGO, RUTINA_JEIK } from '../src/lib/seed';
import { dibujoSVG, tecnicaDe } from '../src/lib/tecnica';

const store = (idb as unknown as { _store: Map<string, unknown> })._store;
beforeEach(() => store.clear());

const fuerza = RUTINA_JEIK.dias.filter((d) => !d.fueraDeRueda).flatMap((d) => d.ejercicios);

describe('perfil de Jeik', () => {
  it('va oculto, en modo sencillo, con «la próxima vez» y dibujos', () => {
    const j = perfil('jeik');
    expect(j).toMatchObject({ oculto: true, modoSencillo: true, proximaVez: true, dibujos: true });
    for (const p of PERFILES.filter((x) => x.id !== 'jeik')) {
      expect(p.oculto, p.id).toBeFalsy();
      expect(p.proximaVez, p.id).toBeFalsy();
    }
  });

  it('entrando por su URL queda como perfil activo con su rutina y 3 días por semana', async () => {
    await initDB();
    await fijarPerfil('jeik');
    expect(getPerfilActivo()).toBe('jeik');
    expect(store.get('perfilActivo')).toBe('jeik');
    expect((await getRutinas()).map((r) => r.id)).toEqual([RUTINA_JEIK.id]);
    const config = await getConfig();
    expect(config.rutinaActivaId).toBe(RUTINA_JEIK.id);
    expect(config.entrenosObjetivoSemana).toBe(3);
    expect(config.fechaInicioPlan).toBe('2026-11-02');
  });

  it('no toca los datos de Jose al entrar', async () => {
    store.set('jose:sesiones', [{ id: 'de-jose' }]);
    await initDB();
    await fijarPerfil('jeik');
    expect(store.get('jose:sesiones')).toEqual([{ id: 'de-jose' }]);
    expect(store.get('jeik:sesiones')).toEqual([]);
  });

  it('no usa jornadas y tiene su dieta de 3 bloques y snack', () => {
    expect(horarioDe('jeik').jornadas).toEqual([]);
    expect(dietaDe('jeik').macros[0].valor).toBe('2.300');
    expect(dietaDe('jeik').platos).toHaveLength(4);
  });
});

describe('rutina de Jeik', () => {
  it('la rueda va A → B → C → A y el cardio no la mueve', () => {
    const ids = RUTINA_JEIK.dias.map((d) => d.id);
    expect(ids).toEqual(['ja', 'jb', 'jc', 'jcardio']);
    expect(RUTINA_JEIK.dias.find((d) => d.id === 'jcardio')?.fueraDeRueda).toBe(true);
    expect(siguienteDia(RUTINA_JEIK, 'ja').id).toBe('jb');
    expect(siguienteDia(RUTINA_JEIK, 'jb').id).toBe('jc');
    expect(siguienteDia(RUTINA_JEIK, 'jc').id).toBe('ja');
    expect(siguienteDia(RUTINA_JEIK, 'jcardio').id).toBe('ja');
  });

  it('todos sus ejercicios están en el catálogo', () => {
    const ids = new Set(CATALOGO.map((e) => e.id));
    for (const e of RUTINA_JEIK.dias.flatMap((d) => d.ejercicios)) expect(ids.has(e.ejercicioId!), e.ejercicioId).toBe(true);
  });

  it('nada que cargue la zona lumbar ni pesos libres', () => {
    const lumbar = ['peso-muerto', 'peso-muerto-rumano', 'rumano-mancuerna', 'hiperextension', 'crunch-polea', 'crunch-declinado'];
    const libres = ['barra', 'barraZ', 'mancuerna', 'kettlebell'];
    for (const e of fuerza) {
      expect(lumbar, e.ejercicioId).not.toContain(e.ejercicioId);
      const ej = CATALOGO.find((x) => x.id === e.ejercicioId)!;
      expect(libres, e.ejercicioId).not.toContain(ej.implemento);
    }
  });

  it('prensa, femoral y laterales comparten ranura entre días: un solo historial', () => {
    for (const ranura of ['j-prensa', 'j-femoral', 'j-laterales']) {
      const dias = RUTINA_JEIK.dias.filter((d) => d.ejercicios.some((e) => e.ranuraId === ranura));
      expect(dias.length, ranura).toBe(2);
    }
  });
});

describe('técnica dibujada', () => {
  it('cada ejercicio de fuerza de Jeik tiene tres pasos, aviso de espalda y dibujo', () => {
    for (const e of fuerza) {
      const t = tecnicaDe(e.ejercicioId);
      expect(t?.pasos, e.ejercicioId).toHaveLength(3);
      expect(t!.espalda.length, e.ejercicioId).toBeGreaterThan(20);
      const svg = dibujoSVG(e.ejercicioId!);
      expect(svg, e.ejercicioId).toMatch(/^<svg /);
      expect(svg, e.ejercicioId).not.toContain('NaN');
    }
  });

  it('con movimiento reducido el dibujo se queda quieto', () => {
    expect(dibujoSVG('prensa-horizontal', true)).toContain('<animate');
    expect(dibujoSVG('prensa-horizontal', false)).not.toContain('<animate');
  });

  it('sin dibujo para un ejercicio desconocido', () => {
    expect(dibujoSVG('no-existe')).toBeNull();
  });
});
