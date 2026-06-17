import type { Config, Ejercicio, Rutina } from './types';

// ───────────────────────── Biblioteca de ejercicios ─────────────────────────
// Pesos de barra del gym de Jose: barra Z = 7 kg, barra recta larga = 20 kg (config.),
// multipower = 0 (contrapeso desconocido, progresión relativa).
export const CATALOGO: Ejercicio[] = [
  // Pierna
  { id: 'prensa-horizontal', nombre: 'Prensa horizontal', patron: 'rodilla', implemento: 'maquina', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'extension-cuadriceps', nombre: 'Extensión de cuádriceps', patron: 'rodilla', implemento: 'maquina', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'curl-femoral', nombre: 'Curl femoral sentado', patron: 'cadera', implemento: 'maquina', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'gemelo-pie', nombre: 'Elevación de gemelo de pie', patron: 'aislamiento', implemento: 'multipower', entrada: 'porLado', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'patada-gluteo', nombre: 'Patada de glúteo', patron: 'cadera', implemento: 'maquina', entrada: 'directa', ejecucion: 'unilateral', pesoBaseKg: 0 },
  // Empuje
  { id: 'press-banca', nombre: 'Press banca (multipower)', patron: 'empujeH', implemento: 'multipower', entrada: 'porLado', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Codos ~45°, no abrir del todo' },
  { id: 'press-inclinado-mancuerna', nombre: 'Press inclinado con mancuernas', patron: 'empujeH', implemento: 'mancuerna', entrada: 'porMancuerna', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'pec-deck', nombre: 'Aperturas en pec deck', patron: 'empujeH', implemento: 'maquina', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'elevacion-lateral', nombre: 'Elevaciones laterales', patron: 'aislamiento', implemento: 'mancuerna', entrada: 'porMancuerna', ejecucion: 'unilateral', pesoBaseKg: 0, nota: 'Meñique alto, no pasar del hombro' },
  { id: 'extension-triceps-polea', nombre: 'Extensión de tríceps en polea', patron: 'aislamiento', implemento: 'polea', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  // Tirón
  { id: 'peso-muerto', nombre: 'Peso muerto', patron: 'cadera', implemento: 'barra', entrada: 'porLado', ejecucion: 'bilateral', pesoBaseKg: 20 },
  { id: 'jalon-pecho', nombre: 'Jalón al pecho', patron: 'traccionV', implemento: 'polea', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0, agarre: 'Prono ancho' },
  { id: 'remo-polea', nombre: 'Remo en polea baja', patron: 'traccionH', implemento: 'polea', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0, agarre: 'Neutro (cuña MAG)' },
  { id: 'curl-z', nombre: 'Curl de bíceps con barra Z', patron: 'aislamiento', implemento: 'barraZ', entrada: 'porLado', ejecucion: 'bilateral', pesoBaseKg: 7 },
  { id: 'face-pull', nombre: 'Face pull en crossover', patron: 'traccionH', implemento: 'polea', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  // Hombro
  { id: 'press-militar-mancuerna', nombre: 'Press militar con mancuernas', patron: 'empujeV', implemento: 'mancuerna', entrada: 'porMancuerna', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'pajaros-crossover', nombre: 'Pájaros en crossover', patron: 'traccionH', implemento: 'polea', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'encogimiento-trapecio', nombre: 'Encogimientos de trapecio', patron: 'aislamiento', implemento: 'mancuerna', entrada: 'porMancuerna', ejecucion: 'bilateral', pesoBaseKg: 0 },
  // Espalda / brazos
  { id: 'peso-muerto-rumano', nombre: 'Peso muerto rumano', patron: 'cadera', implemento: 'barra', entrada: 'porLado', ejecucion: 'bilateral', pesoBaseKg: 20 },
  { id: 'remo-maquina', nombre: 'Remo en máquina (apoyo de pecho)', patron: 'traccionH', implemento: 'maquina', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'curl-mancuerna', nombre: 'Curl de bíceps con mancuernas', patron: 'aislamiento', implemento: 'mancuerna', entrada: 'porMancuerna', ejecucion: 'bilateral', pesoBaseKg: 0 },
  // Core
  { id: 'plancha', nombre: 'Plancha', patron: 'core', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'elevacion-piernas', nombre: 'Elevación de piernas', patron: 'core', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0 },
];

// ───────────────────────────────── Rutina ───────────────────────────────────
export const RUTINA_1: Rutina = {
  id: 'rutina-1',
  nombre: 'Fuerza + Estética · 5 días',
  dias: [
    {
      id: 'd1',
      nombre: 'Pierna',
      emoji: '🦵',
      ejercicios: [
        { ranuraId: 'd1-prensa', ejercicioId: 'prensa-horizontal', nombre: 'Prensa horizontal', tipoProgresion: 'doble', series: 4, repsObjetivo: [8, 12], incrementoKg: 5, restSeg: 150 },
        { ranuraId: 'd1-extension', ejercicioId: 'extension-cuadriceps', nombre: 'Extensión de cuádriceps', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'd1-femoral', ejercicioId: 'curl-femoral', nombre: 'Curl femoral sentado', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'd1-gemelo', ejercicioId: 'gemelo-pie', nombre: 'Elevación de gemelo de pie', tipoProgresion: 'doble', series: 4, repsObjetivo: [12, 20], incrementoKg: 2.5, restSeg: 60 },
        { ranuraId: 'd1-plancha', ejercicioId: 'plancha', nombre: 'Plancha', tipoProgresion: 'tiempo', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 60 },
      ],
    },
    {
      id: 'd2',
      nombre: 'Empuje',
      emoji: '💪',
      ejercicios: [
        { ranuraId: 'd2-banca', ejercicioId: 'press-banca', nombre: 'Press banca (multipower)', tipoProgresion: 'lineal', series: 4, repsObjetivo: 5, incrementoKg: 2.5, restSeg: 180 },
        { ranuraId: 'd2-inclinado', ejercicioId: 'press-inclinado-mancuerna', nombre: 'Press inclinado con mancuernas', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2, restSeg: 90 },
        { ranuraId: 'd2-pecdeck', ejercicioId: 'pec-deck', nombre: 'Aperturas en pec deck', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 5, restSeg: 75 },
        { ranuraId: 'd2-laterales', ejercicioId: 'elevacion-lateral', nombre: 'Elevaciones laterales', tipoProgresion: 'doble', series: 4, repsObjetivo: [12, 20], incrementoKg: 2, restSeg: 60, nota: 'Meñique alto, no pasar del hombro' },
        { ranuraId: 'd2-triceps', ejercicioId: 'extension-triceps-polea', nombre: 'Extensión de tríceps en polea', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 2.5, restSeg: 75 },
      ],
    },
    {
      id: 'd3',
      nombre: 'Tirón',
      emoji: '🔙',
      ejercicios: [
        { ranuraId: 'd3-muerto', ejercicioId: 'peso-muerto', nombre: 'Peso muerto', tipoProgresion: 'lineal', series: 4, repsObjetivo: 4, incrementoKg: 2.5, restSeg: 180 },
        { ranuraId: 'd3-jalon', ejercicioId: 'jalon-pecho', nombre: 'Jalón al pecho', tipoProgresion: 'doble', series: 4, repsObjetivo: [6, 10], incrementoKg: 5, restSeg: 120 },
        { ranuraId: 'd3-remo', ejercicioId: 'remo-polea', nombre: 'Remo en polea baja', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'd3-curl', ejercicioId: 'curl-z', nombre: 'Curl de bíceps con barra Z', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 1.25, restSeg: 75 },
        { ranuraId: 'd3-facepulls', ejercicioId: 'face-pull', nombre: 'Face pull en crossover', tipoProgresion: 'doble', series: 3, repsObjetivo: [15, 20], incrementoKg: 2.5, restSeg: 60 },
      ],
    },
    {
      id: 'd4',
      nombre: 'Hombro',
      emoji: '🪖',
      ejercicios: [
        { ranuraId: 'd4-militar', ejercicioId: 'press-militar-mancuerna', nombre: 'Press militar con mancuernas', tipoProgresion: 'doble', series: 4, repsObjetivo: [6, 10], incrementoKg: 2, restSeg: 150 },
        { ranuraId: 'd4-laterales', ejercicioId: 'elevacion-lateral', nombre: 'Elevaciones laterales', tipoProgresion: 'doble', series: 4, repsObjetivo: [15, 20], incrementoKg: 2, restSeg: 60, nota: 'Meñique alto, no pasar del hombro' },
        { ranuraId: 'd4-pajaros', ejercicioId: 'pajaros-crossover', nombre: 'Pájaros en crossover', tipoProgresion: 'doble', series: 3, repsObjetivo: [15, 20], incrementoKg: 2.5, restSeg: 60 },
        { ranuraId: 'd4-trapecio', ejercicioId: 'encogimiento-trapecio', nombre: 'Encogimientos de trapecio', tipoProgresion: 'doble', series: 3, repsObjetivo: [12, 15], incrementoKg: 2, restSeg: 75 },
        { ranuraId: 'd4-triceps', ejercicioId: 'extension-triceps-polea', nombre: 'Extensión de tríceps en polea', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 2.5, restSeg: 75 },
      ],
    },
    {
      id: 'd5',
      nombre: 'Posterior + brazos',
      emoji: '🦾',
      ejercicios: [
        { ranuraId: 'd5-rumano', ejercicioId: 'peso-muerto-rumano', nombre: 'Peso muerto rumano', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 120 },
        { ranuraId: 'd5-remo-maquina', ejercicioId: 'remo-maquina', nombre: 'Remo en máquina (apoyo de pecho)', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'd5-gluteo', ejercicioId: 'patada-gluteo', nombre: 'Patada de glúteo', tipoProgresion: 'doble', series: 3, repsObjetivo: [12, 15], incrementoKg: 5, restSeg: 75, nota: 'Por pierna' },
        { ranuraId: 'd5-curl', ejercicioId: 'curl-mancuerna', nombre: 'Curl de bíceps con mancuernas', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2, restSeg: 75, superserieId: 'd5-brazos' },
        { ranuraId: 'd5-triceps', ejercicioId: 'extension-triceps-polea', nombre: 'Extensión de tríceps en polea', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 75, superserieId: 'd5-brazos' },
        { ranuraId: 'd5-abdomen', ejercicioId: 'elevacion-piernas', nombre: 'Elevación de piernas', tipoProgresion: 'libre', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 60 },
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
