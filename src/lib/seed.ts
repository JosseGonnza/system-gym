import type { Config, Rutina } from './types';

export const RUTINA_1: Rutina = {
  id: 'rutina-1',
  nombre: 'Fuerza + Estética · 5 días',
  dias: [
    {
      id: 'd1',
      nombre: 'Pierna',
      emoji: '🦵',
      ejercicios: [
        { ranuraId: 'd1-sentadilla', nombre: 'Sentadilla trasera', tipoProgresion: 'lineal', series: 4, repsObjetivo: 5, incrementoKg: 2.5, restSeg: 180 },
        { ranuraId: 'd1-rumano', nombre: 'Peso muerto rumano', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'd1-zancadas', nombre: 'Zancadas', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 12], incrementoKg: 2.5, restSeg: 90, nota: 'Por pierna' },
        { ranuraId: 'd1-gemelo', nombre: 'Elevación de gemelo', tipoProgresion: 'doble', series: 4, repsObjetivo: [15, 20], incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'd1-plancha', nombre: 'Plancha', tipoProgresion: 'tiempo', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 60 },
      ],
    },
    {
      id: 'd2',
      nombre: 'Empuje',
      emoji: '💪',
      ejercicios: [
        { ranuraId: 'd2-banca', nombre: 'Press banca', tipoProgresion: 'lineal', series: 4, repsObjetivo: 5, incrementoKg: 2.5, restSeg: 180 },
        { ranuraId: 'd2-inclinado', nombre: 'Press inclinado mancuernas', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'd2-fondos', nombre: 'Fondos en paralelas', tipoProgresion: 'pesoCorporal', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'd2-laterales', nombre: 'Elevaciones laterales', tipoProgresion: 'doble', series: 4, repsObjetivo: [12, 20], incrementoKg: 2.5, restSeg: 90, nota: 'Meñique alto, no pasar del hombro' },
        { ranuraId: 'd2-triceps', nombre: 'Extensión de tríceps', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 2.5, restSeg: 90 },
      ],
    },
    {
      id: 'd3',
      nombre: 'Tirón',
      emoji: '🔙',
      ejercicios: [
        { ranuraId: 'd3-muerto', nombre: 'Peso muerto', tipoProgresion: 'lineal', series: 4, repsObjetivo: 4, incrementoKg: 5, restSeg: 180 },
        { ranuraId: 'd3-remo', nombre: 'Remo con barra', tipoProgresion: 'doble', series: 4, repsObjetivo: [6, 8], incrementoKg: 2.5, restSeg: 120 },
        { ranuraId: 'd3-dominadas', nombre: 'Dominadas', tipoProgresion: 'pesoCorporal', series: 3, repsObjetivo: [5, 10], incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'd3-curl', nombre: 'Curl bíceps con barra', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'd3-facepulls', nombre: 'Face pulls / pájaros', tipoProgresion: 'doble', series: 3, repsObjetivo: [15, 20], incrementoKg: 2.5, restSeg: 90 },
      ],
    },
    {
      id: 'd4',
      nombre: 'Hombro',
      emoji: '🪖',
      ejercicios: [
        { ranuraId: 'd4-militar', nombre: 'Press militar', tipoProgresion: 'lineal', series: 4, repsObjetivo: 5, incrementoKg: 2.5, restSeg: 180 },
        { ranuraId: 'd4-banca-ligero', nombre: 'Press banca (ligero)', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 10], incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'd4-laterales', nombre: 'Elevaciones laterales', tipoProgresion: 'doble', series: 4, repsObjetivo: [15, 20], incrementoKg: 2.5, restSeg: 90, nota: 'Meñique alto, no pasar del hombro' },
        { ranuraId: 'd4-triceps', nombre: 'Extensión de tríceps', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'd4-trapecio', nombre: 'Encogimientos trapecio', tipoProgresion: 'doble', series: 3, repsObjetivo: [12, 15], incrementoKg: 2.5, restSeg: 90 },
      ],
    },
    {
      id: 'd5',
      nombre: 'Pierna/Espalda + brazos',
      emoji: '🦵',
      ejercicios: [
        { ranuraId: 'd5-frontal', nombre: 'Sentadilla frontal', tipoProgresion: 'lineal', series: 4, repsObjetivo: 6, incrementoKg: 2.5, restSeg: 180 },
        { ranuraId: 'd5-remo-mancuerna', nombre: 'Remo con mancuerna', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'd5-rumano', nombre: 'Peso muerto rumano', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'd5-curl', nombre: 'Curl bíceps', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 90, superserieId: 'd5-brazos' },
        { ranuraId: 'd5-triceps', nombre: 'Extensión tríceps', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 90, superserieId: 'd5-brazos' },
        { ranuraId: 'd5-abdomen', nombre: 'Elevación de piernas', tipoProgresion: 'libre', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 60 },
      ],
    },
  ],
};

export const CONFIG_INICIAL: Config = {
  rutinaActivaId: 'rutina-1',
  fechaInicioPlan: '2026-06-10',
  macros: { kcal: 2900, prot: 150, grasa: 70, carbo: 415 },
  puntero: { ultimoDiaCompletadoId: null },
  incrementoMinimoKg: 2.5,
  entrenosObjetivoSemana: 5,
  restTimerActivo: true,
  ultimoExportISO: null,
};
