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
import { anotarMedida, exportarBackup, fijarPerfil, getDomingos, getMediciones, importarBackup, initDB, patchDomingo, resetDB } from '../src/lib/db';
import { RUTINA_JEIK } from '../src/lib/seed';
import { asunto, domingoACerrar, domingosHasta, mailto, resumenSemana, textoSeguimiento } from '../src/lib/seguimiento';
import type { Mediciones, Sesion } from '../src/lib/types';

const store = (idb as unknown as { _store: Map<string, unknown> })._store;
beforeEach(() => store.clear());

const sesion = (fecha: string, diaId: string, ejercicios: Sesion['ejercicios'], notas = ''): Sesion => ({
  id: `${fecha}-${diaId}`,
  fecha,
  inicioISO: null,
  finISO: null,
  rutinaId: RUTINA_JEIK.id,
  diaId,
  estado: 'finalizada',
  suenoH: null,
  energia: null,
  duracionMin: null,
  ejercicios,
  notas,
});
const hecha = (peso: number | null, extra: Partial<Sesion['ejercicios'][0]['series'][0]> = {}) => ({ peso, reps: null, estado: 'completada' as const, ...extra });

const SESIONES: Sesion[] = [
  sesion('2026-11-03', 'ja', [
    { ranuraId: 'j-prensa', nombre: 'Prensa de piernas', series: [hecha(100), hecha(100), hecha(100)], sensacion: 'facil', molestia: true },
    { ranuraId: 'j-plancha', nombre: 'Plancha sobre antebrazos', series: [hecha(null, { segundos: 30 }), hecha(null, { segundos: 30 })], sensacion: 'bien' },
    { ranuraId: 'j-femoral', nombre: 'Curl femoral sentado', series: [{ peso: 30, reps: null, estado: 'pendiente' }] },
  ], 'Me dolió un poco al final'),
  sesion('2026-11-04', 'jcardio', [
    { ranuraId: 'j-cardio-cinta', nombre: 'Cinta inclinada', series: [{ peso: null, reps: null, segundos: null, estado: 'pendiente' }] },
    { ranuraId: 'j-cardio-bici', nombre: 'Bici', series: [hecha(null, { segundos: 1800 })] },
  ]),
  sesion('2026-11-10', 'jb', []),
];
const MED: Mediciones = {
  peso: [{ fecha: '2026-11-03', kg: 74.6 }, { fecha: '2026-11-05', kg: 74.2 }, { fecha: '2026-11-10', kg: 80 }],
  cintura: [{ fecha: '2026-11-08', cm: 88 }],
};
const COMIDAS = {
  '2026-11-03': { cena: { tipo: 'otra' as const, texto: 'Pizza con los amigos' }, snack: [{ t: 'fruta' }] },
  '2026-11-04': { comida: { tipo: 'opcion' as const, id: 'c1' } },
};

describe('qué semana se cierra', () => {
  it('antes del primer domingo, el primero', () => {
    expect(domingoACerrar('2026-11-03', {})).toBe('2026-11-08');
  });

  it('entre semana, el domingo de esa semana', () => {
    expect(domingoACerrar('2026-11-12', {})).toBe('2026-11-15');
    expect(domingoACerrar('2026-11-15', {})).toBe('2026-11-15');
  });

  it('lunes y martes, la anterior si quedó sin cerrar', () => {
    expect(domingoACerrar('2026-11-09', {})).toBe('2026-11-08');
    expect(domingoACerrar('2026-11-10', {})).toBe('2026-11-08');
    expect(domingoACerrar('2026-11-11', {})).toBe('2026-11-15');
    expect(domingoACerrar('2026-11-09', { '2026-11-08': { cerrado: true } })).toBe('2026-11-15');
  });
});

describe('resumen y correo', () => {
  const r = resumenSemana('2026-11-08', SESIONES, RUTINA_JEIK, MED, COMIDAS);

  it('separa gimnasio y cardio, y solo cuenta su semana', () => {
    expect(r.gym.map((s) => s.diaId)).toEqual(['ja']);
    expect(r.cardio.map((s) => s.diaId)).toEqual(['jcardio']);
    expect(r.pesos).toEqual([74.6, 74.2]);
    expect(r.media).toBeCloseTo(74.4);
    expect(r.cintura).toBe(88);
    expect(r.comidas).toEqual({ plan: 1, otra: 1, salto: 0, snacks: 1 });
  });

  it('el correo lleva lo que Jose necesita leer', () => {
    const t = textoSeguimiento('2026-11-08', { hambre: 3, salidas: 1, fotos: ['frente', 'perfil'], nota: 'Bien' }, r, RUTINA_JEIK, COMIDAS);
    expect(t).toContain('Semana 1 · bloque 1 · del lun 2 al dom 8');
    expect(t).toContain('Gimnasio 1/3 · Cardio 1/2');
    expect(t).toContain('   Prensa de piernas: 100 kg · 3 series (subir) (MOLESTIA)');
    expect(t).toContain('   Plancha sobre antebrazos: 30 s, 30 s (igual)');
    expect(t).not.toContain('Curl femoral');
    expect(t).toContain('   Nota: Me dolió un poco al final');
    expect(t).toContain('- mié 4: cardio, bici, 30 min');
    expect(t).toContain('Peso medio 74,4 kg (74,6 · 74,2)');
    expect(t).toContain('Cintura 88,0 cm');
    expect(t).toContain('Fotos: 2 de 3 hechas');
    expect(t).toContain('- mar 3, cena: Pizza con los amigos');
    expect(t).toContain('Hambre 3/5 · Sueño –/5 · Energía –/5');
    expect(t).toContain('Salidas de fiesta: una');
    expect(t.endsWith('Bien')).toBe(true);
  });

  it('el mailto lleva asunto y cuerpo codificados', () => {
    expect(asunto('2026-11-15')).toBe('Seguimiento semana 2');
    const m = mailto('jose@ejemplo.com', '2026-11-08', 'a & b\r\nc');
    expect(m).toBe('mailto:jose@ejemplo.com?subject=Seguimiento%20semana%201&body=a%20%26%20b%0D%0Ac');
  });

  it('tus semanas van de la última a la primera', () => {
    expect(domingosHasta('2026-11-22')).toEqual(['2026-11-22', '2026-11-15', '2026-11-08']);
  });
});

describe('guardado del domingo', () => {
  it('se guarda por partes y la cintura va a mediciones', async () => {
    await initDB();
    await fijarPerfil('jeik');
    await patchDomingo('2026-11-08', { hambre: 2 });
    await patchDomingo('2026-11-08', { cerrado: true });
    expect((await getDomingos())['2026-11-08']).toEqual({ hambre: 2, cerrado: true });
    await anotarMedida('cintura', '2026-11-08', 88);
    await anotarMedida('cintura', '2026-11-08', 87.5);
    expect((await getMediciones()).cintura).toEqual([{ fecha: '2026-11-08', cm: 87.5 }]);
  });

  it('el backup lleva los domingos y el import los devuelve', async () => {
    await initDB();
    await fijarPerfil('jeik');
    await patchDomingo('2026-11-08', { salidas: 2, fotos: ['frente'] });
    const b = await exportarBackup();
    await resetDB();
    expect(await getDomingos()).toEqual({});
    await importarBackup(b);
    expect(await getDomingos()).toEqual({ '2026-11-08': { salidas: 2, fotos: ['frente'] } });
  });
});
