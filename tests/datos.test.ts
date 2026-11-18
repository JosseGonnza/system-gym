import { describe, expect, it } from 'vitest';
import { filasSeries, pesoCorporalEn, semanaISO, validarBackup } from '../src/lib/datos';
import { CATALOGO } from '../src/lib/seed';
import type { BackupV2, Rutina, Sesion } from '../src/lib/types';

const rutina = {
  id: 'r1',
  nombre: 'Rueda de 4',
  dias: [
    {
      id: 'empuje',
      nombre: 'Empuje',
      emoji: '',
      ejercicios: [
        { ranuraId: 'e-banca', ejercicioId: 'press-banca', nombre: 'Banca', tipoProgresion: 'lineal' },
        { ranuraId: 'e-fondos', ejercicioId: 'fondos-paralelas', nombre: 'Fondos', tipoProgresion: 'pesoCorporal' },
        { ranuraId: 'e-plancha', ejercicioId: 'plancha', nombre: 'Plancha', tipoProgresion: 'tiempo' },
        { ranuraId: 'e-curl', ejercicioId: 'curl-mancuerna', nombre: 'Curl', tipoProgresion: 'doble' },
      ],
    },
  ],
} as unknown as Rutina;

const sesion = (p: Partial<Sesion>): Sesion =>
  ({
    id: 's1',
    fecha: '2026-11-17',
    inicioISO: '2026-11-17T12:00:00Z',
    rutinaId: 'r1',
    diaId: 'empuje',
    estado: 'finalizada',
    suenoH: 7.5,
    energia: 4,
    ejercicios: [],
    notas: '',
    ...p,
  }) as Sesion;

const backup = (sesiones: Sesion[], peso = [{ fecha: '2026-11-01', kg: 70 }]): BackupV2 =>
  ({
    version: 2,
    app: 'gym',
    exportadoISO: '2026-11-18T07:46:02.968Z',
    perfil: 'jose',
    config: {},
    catalogo: CATALOGO,
    rutinas: [rutina],
    sesiones,
    mediciones: { peso, cintura: [] },
    diario: {},
  }) as unknown as BackupV2;

describe('validarBackup', () => {
  it('acepta un backup v2 de Jose', () => {
    const r = validarBackup(backup([]));
    expect(r.ok).toBe(true);
  });

  it('acepta un v2 sin perfil (de antes de los perfiles)', () => {
    const b = { ...backup([]), perfil: undefined };
    expect(validarBackup(b).ok).toBe(true);
  });

  it('rechaza lo que no es un backup de la app', () => {
    expect(validarBackup(null)).toEqual({ ok: false, error: expect.stringMatching(/no es un backup/i) });
    expect(validarBackup({ app: 'otra' }).ok).toBe(false);
  });

  it('rechaza el formato antiguo v1 con un mensaje claro', () => {
    const r = validarBackup({ ...backup([]), version: 1 });
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/antiguo/i) });
  });

  it('rechaza el backup de otro perfil', () => {
    const r = validarBackup({ ...backup([]), perfil: 'yasmina' });
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/yasmina/i) });
  });

  it('rechaza un backup sin sesiones', () => {
    expect(validarBackup({ ...backup([]), sesiones: undefined }).ok).toBe(false);
  });
});

describe('pesoCorporalEn', () => {
  const pesos = [
    { fecha: '2026-11-10', kg: 71.8 },
    { fecha: '2026-06-11', kg: 68 },
  ];

  it('usa el último pesaje en o antes de la fecha', () => {
    expect(pesoCorporalEn(pesos, '2026-11-12')).toBe(71.8);
    expect(pesoCorporalEn(pesos, '2026-11-09')).toBe(68);
  });

  it('antes del primer pesaje usa el primero', () => {
    expect(pesoCorporalEn(pesos, '2026-06-01')).toBe(68);
  });

  it('sin pesajes devuelve 0', () => {
    expect(pesoCorporalEn([], '2026-06-01')).toBe(0);
  });
});

describe('semanaISO', () => {
  it('numera las semanas de lunes a domingo', () => {
    expect(semanaISO('2026-11-16')).toBe('2026-S47');
    expect(semanaISO('2026-11-22')).toBe('2026-S47');
    expect(semanaISO('2026-11-23')).toBe('2026-S48');
  });

  it('los primeros días de enero pueden ser de la última semana del año anterior', () => {
    expect(semanaISO('2027-01-01')).toBe('2026-S53');
  });
});

describe('filasSeries', () => {
  it('una fila por serie hecha; las pendientes no cuentan', () => {
    const s = sesion({
      ejercicios: [
        {
          ranuraId: 'e-curl',
          nombre: 'Curl',
          series: [
            { peso: 12, reps: 10, estado: 'completada' },
            { peso: 12, reps: 8, estado: 'fallo' },
            { peso: 12, reps: null, estado: 'pendiente' },
          ],
        },
      ],
    });
    const f = filasSeries(backup([s]));
    expect(f).toHaveLength(2);
    expect(f.map((x) => x.n)).toEqual([1, 2]);
    expect(f[1]).toMatchObject({
      fecha: '2026-11-17',
      semana: '2026-S47',
      rutina: 'Rueda de 4',
      dia: 'Empuje',
      ejercicio: 'Curl de bíceps con mancuernas',
      musculo: 'Bíceps',
      estado: 'fallo',
      sueno: 7.5,
      energia: 4,
    });
  });

  it('por lado: el kg real suma la barra y dobla; el 1RM y el tonelaje van sobre el real', () => {
    const s = sesion({
      ejercicios: [{ ranuraId: 'e-banca', nombre: 'Banca', series: [{ peso: 30, reps: 5, estado: 'completada' }] }],
    });
    const [f] = filasSeries(backup([s]));
    expect(f.kg).toBe(30);
    expect(f.kgReal).toBe(60);
    expect(f.e1rm).toBeCloseTo(70, 5);
    expect(f.tonelaje).toBe(300);
  });

  it('lastre: kg real = peso corporal de ese día + lastre; sin 1RM (peso corporal)', () => {
    const s = sesion({
      ejercicios: [{ ranuraId: 'e-fondos', nombre: 'Fondos', series: [{ peso: null, reps: 10, lastreKg: 5, estado: 'completada' }] }],
    });
    const [f] = filasSeries(backup([s]));
    expect(f.lastre).toBe(5);
    expect(f.kgReal).toBe(75);
    expect(f.e1rm).toBeNull();
    expect(f.tonelaje).toBe(750);
  });

  it('tiempo: guarda los segundos, sin kg ni tonelaje', () => {
    const s = sesion({
      ejercicios: [{ ranuraId: 'e-plancha', nombre: 'Plancha', series: [{ peso: null, reps: null, segundos: 45, estado: 'completada' }] }],
    });
    const [f] = filasSeries(backup([s]));
    expect(f.seg).toBe(45);
    expect(f.kgReal).toBeNull();
    expect(f.tonelaje).toBeNull();
  });

  it('por encima de 12 reps no hay 1RM', () => {
    const s = sesion({
      ejercicios: [{ ranuraId: 'e-curl', nombre: 'Curl', series: [{ peso: 10, reps: 15, estado: 'completada' }] }],
    });
    expect(filasSeries(backup([s]))[0].e1rm).toBeNull();
  });

  it('ranuras viejas que ya no están en ninguna rutina: las reconoce por su id', () => {
    const s = sesion({
      ejercicios: [{ ranuraId: 'd3-muerto', nombre: 'Peso muerto', series: [{ peso: 15, reps: 4, estado: 'completada' }] }],
    });
    const [f] = filasSeries(backup([s]));
    expect(f.ejercicio).toBe('Peso muerto');
    expect(f.kgReal).toBe(50);
  });

  it('sin catálogo: el kg real es el apuntado, o el peso corporal más el lastre (asistencia en negativo)', () => {
    const s = sesion({
      ejercicios: [
        { ranuraId: 'd3-dominadas', nombre: 'Dominadas', series: [{ peso: null, reps: 5, lastreKg: -27.5, estado: 'fallo' }] },
        { ranuraId: 'rara', nombre: 'Cosa rara', series: [{ peso: 20, reps: 8, estado: 'completada' }] },
      ],
    });
    const [dom, rara] = filasSeries(backup([s]));
    expect(dom).toMatchObject({ ejercicio: 'Dominadas', ejercicioId: null, kgReal: 42.5, e1rm: null });
    expect(rara).toMatchObject({ ejercicio: 'Cosa rara', kgReal: 20 });
  });

  it('ordena por fecha y, dentro del día, por hora de inicio', () => {
    const serie = [{ peso: 10, reps: 8, estado: 'completada' as const }];
    const ej = [{ ranuraId: 'e-curl', nombre: 'Curl', series: serie }];
    const f = filasSeries(
      backup([
        sesion({ id: 'b', fecha: '2026-11-17', inicioISO: '2026-11-17T18:00:00Z', ejercicios: ej }),
        sesion({ id: 'c', fecha: '2026-11-10', ejercicios: ej }),
        sesion({ id: 'a', fecha: '2026-11-17', inicioISO: '2026-11-17T08:00:00Z', ejercicios: ej }),
      ]),
    );
    expect(f.map((x) => x.sesionId)).toEqual(['c', 'a', 'b']);
  });

  it('los borradores no entran', () => {
    const s = sesion({
      estado: 'borrador',
      ejercicios: [{ ranuraId: 'e-curl', nombre: 'Curl', series: [{ peso: 10, reps: 8, estado: 'completada' }] }],
    });
    expect(filasSeries(backup([s]))).toHaveLength(0);
  });
});
