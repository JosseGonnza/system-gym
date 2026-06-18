import type { Config, Ejercicio, Rutina } from './types';

// ───────────────────────── Biblioteca de ejercicios ─────────────────────────
// Pesos de barra del gym de Jose: barra Z = 7 kg, barra recta larga = 20 kg (config.),
// multipower = 0 (contrapeso desconocido, progresión relativa).
export const CATALOGO: Ejercicio[] = [
  // Pierna
  { id: 'prensa-horizontal', nombre: 'Prensa horizontal', patron: 'rodilla', implemento: 'maquina', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'extension-cuadriceps', nombre: 'Extensión de cuádriceps', patron: 'rodilla', implemento: 'maquina', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'curl-femoral', nombre: 'Curl femoral sentado', patron: 'cadera', implemento: 'maquina', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'gemelo-prensa', nombre: 'Elevación de gemelo en prensa', patron: 'aislamiento', implemento: 'maquina', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
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
  // — Añadidos para Yasmina —
  { id: 'hip-thrust', nombre: 'Hip thrust (empuje de cadera)', patron: 'cadera', implemento: 'multipower', entrada: 'porLado', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Barra guiada sobre la cadera, o mancuerna/KB para empezar' },
  { id: 'rumano-mancuerna', nombre: 'Peso muerto rumano con mancuernas', patron: 'cadera', implemento: 'mancuerna', entrada: 'porMancuerna', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Bajar con la espalda recta, sin pasar dolor lumbar' },
  { id: 'abduccion-cadera', nombre: 'Abducción de cadera (glúteo medio)', patron: 'aislamiento', implemento: 'polea', entrada: 'directa', ejecucion: 'unilateral', pesoBaseKg: 0, nota: 'En polea con tobillera, o con banda elástica' },
  { id: 'dead-bug', nombre: 'Dead bug', patron: 'core', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'bird-dog', nombre: 'Bird dog', patron: 'core', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'unilateral', pesoBaseKg: 0 },
  { id: 'cardio-cinta', nombre: 'Cardio en cinta inclinada', patron: 'movilidad', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0, nota: '25-35 min con inclinación, ritmo cómodo. Bajo impacto para las rodillas' },
  { id: 'calent-inferior', nombre: 'Calentamiento tren inferior', patron: 'movilidad', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Cinta inclinada 5\' · activación glúteo con banda 2×15 · gato-camello + círculos de cadera' },
  { id: 'calent-superior', nombre: 'Calentamiento tren superior', patron: 'movilidad', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Movilidad de hombro con banda · manguito rotador (rotación externa) 2×15 · remo ligero de activación' },
  { id: 'estiram-inferior', nombre: 'Estiramientos tren inferior', patron: 'movilidad', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Cuádriceps suave · glúteo (figura 4) · isquios · gemelo' },
  { id: 'estiram-superior', nombre: 'Estiramientos tren superior', patron: 'movilidad', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Pecho/hombro en marco de puerta · dorsal · cuello-trapecio' },
  { id: 'movilidad-completa', nombre: 'Movilidad completa', patron: 'movilidad', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Cadera, columna dorsal, hombro y tobillo' },
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
        { ranuraId: 'd1-gemelo', ejercicioId: 'gemelo-prensa', nombre: 'Elevación de gemelo en prensa', tipoProgresion: 'doble', series: 4, repsObjetivo: [12, 20], incrementoKg: 5, restSeg: 60 },
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

// ───────────────────────── Perfil de Yasmina ─────────────────────────
// Recomposición · 5 días de máquinas cuidando rodillas (condromalacia) y
// hombros (tendinitis). Cada día abre con calentamiento y cierra con estiramientos.
export const RUTINA_YASMINA: Rutina = {
  id: 'rutina-yasmina',
  nombre: 'Recomposición · 5 días',
  dias: [
    {
      id: 'd1',
      nombre: 'Tren inferior (glúteo)',
      emoji: '🍑',
      ejercicios: [
        { ranuraId: 'yd1-calent', ejercicioId: 'calent-inferior', nombre: 'Calentamiento tren inferior', tipoProgresion: 'libre', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 30 },
        { ranuraId: 'yd1-hipthrust', ejercicioId: 'hip-thrust', nombre: 'Hip thrust (empuje de cadera)', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 120 },
        { ranuraId: 'yd1-prensa', ejercicioId: 'prensa-horizontal', nombre: 'Prensa horizontal', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 5, restSeg: 90, nota: 'Rango parcial, sin dolor de rodilla' },
        { ranuraId: 'yd1-femoral', ejercicioId: 'curl-femoral', nombre: 'Curl femoral sentado', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'yd1-gluteo', ejercicioId: 'patada-gluteo', nombre: 'Patada de glúteo', tipoProgresion: 'doble', series: 3, repsObjetivo: [12, 15], incrementoKg: 5, restSeg: 75, nota: 'Por pierna' },
        { ranuraId: 'yd1-gemelo', ejercicioId: 'gemelo-prensa', nombre: 'Elevación de gemelo en prensa', tipoProgresion: 'doble', series: 3, repsObjetivo: [12, 20], incrementoKg: 5, restSeg: 60 },
        { ranuraId: 'yd1-estir', ejercicioId: 'estiram-inferior', nombre: 'Estiramientos tren inferior', tipoProgresion: 'libre', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 30 },
      ],
    },
    {
      id: 'd2',
      nombre: 'Tren superior',
      emoji: '💪',
      ejercicios: [
        { ranuraId: 'yd2-calent', ejercicioId: 'calent-superior', nombre: 'Calentamiento tren superior', tipoProgresion: 'libre', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 30 },
        { ranuraId: 'yd2-press', ejercicioId: 'press-banca', nombre: 'Press de pecho (multipower)', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 12], incrementoKg: 2.5, restSeg: 120 },
        { ranuraId: 'yd2-jalon', ejercicioId: 'jalon-pecho', nombre: 'Jalón al pecho', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 12], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'yd2-remo', ejercicioId: 'remo-maquina', nombre: 'Remo en máquina (apoyo de pecho)', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 12], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'yd2-laterales', ejercicioId: 'elevacion-lateral', nombre: 'Elevaciones laterales', tipoProgresion: 'doble', series: 3, repsObjetivo: [12, 15], incrementoKg: 2, restSeg: 60, nota: 'Ligeras, sin dolor de hombro' },
        { ranuraId: 'yd2-facepull', ejercicioId: 'face-pull', nombre: 'Face pull en crossover', tipoProgresion: 'doble', series: 3, repsObjetivo: [15, 20], incrementoKg: 2.5, restSeg: 60 },
        { ranuraId: 'yd2-estir', ejercicioId: 'estiram-superior', nombre: 'Estiramientos tren superior', tipoProgresion: 'libre', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 30 },
      ],
    },
    {
      id: 'd3',
      nombre: 'Cardio + core + movilidad',
      emoji: '🏃‍♀️',
      ejercicios: [
        { ranuraId: 'yd3-cardio', ejercicioId: 'cardio-cinta', nombre: 'Cardio en cinta inclinada', tipoProgresion: 'libre', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 0 },
        { ranuraId: 'yd3-plancha', ejercicioId: 'plancha', nombre: 'Plancha', tipoProgresion: 'tiempo', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 60 },
        { ranuraId: 'yd3-deadbug', ejercicioId: 'dead-bug', nombre: 'Dead bug', tipoProgresion: 'libre', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 45 },
        { ranuraId: 'yd3-birddog', ejercicioId: 'bird-dog', nombre: 'Bird dog', tipoProgresion: 'libre', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 45 },
        { ranuraId: 'yd3-movilidad', ejercicioId: 'movilidad-completa', nombre: 'Movilidad completa', tipoProgresion: 'libre', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 0 },
      ],
    },
    {
      id: 'd4',
      nombre: 'Tren inferior (isquio)',
      emoji: '🦵',
      ejercicios: [
        { ranuraId: 'yd4-calent', ejercicioId: 'calent-inferior', nombre: 'Calentamiento tren inferior', tipoProgresion: 'libre', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 30 },
        { ranuraId: 'yd4-rumano', ejercicioId: 'rumano-mancuerna', nombre: 'Peso muerto rumano con mancuernas', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2, restSeg: 120 },
        { ranuraId: 'yd4-prensa', ejercicioId: 'prensa-horizontal', nombre: 'Prensa horizontal', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 5, restSeg: 90, nota: 'Pies altos (énfasis glúteo/isquio), rango parcial' },
        { ranuraId: 'yd4-femoral', ejercicioId: 'curl-femoral', nombre: 'Curl femoral sentado', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'yd4-abduccion', ejercicioId: 'abduccion-cadera', nombre: 'Abducción de cadera (glúteo medio)', tipoProgresion: 'doble', series: 3, repsObjetivo: [15, 20], incrementoKg: 5, restSeg: 60, nota: 'Por pierna' },
        { ranuraId: 'yd4-plancha', ejercicioId: 'plancha', nombre: 'Plancha', tipoProgresion: 'tiempo', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 60 },
        { ranuraId: 'yd4-estir', ejercicioId: 'estiram-inferior', nombre: 'Estiramientos tren inferior', tipoProgresion: 'libre', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 30 },
      ],
    },
    {
      id: 'd5',
      nombre: 'Tren superior (espalda + brazos)',
      emoji: '🔙',
      ejercicios: [
        { ranuraId: 'yd5-calent', ejercicioId: 'calent-superior', nombre: 'Calentamiento tren superior', tipoProgresion: 'libre', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 30 },
        { ranuraId: 'yd5-remo', ejercicioId: 'remo-polea', nombre: 'Remo en polea baja', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 12], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'yd5-jalon', ejercicioId: 'jalon-pecho', nombre: 'Jalón al pecho', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 12], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'yd5-pecdeck', ejercicioId: 'pec-deck', nombre: 'Aperturas en pec deck', tipoProgresion: 'doble', series: 3, repsObjetivo: [12, 15], incrementoKg: 5, restSeg: 75 },
        { ranuraId: 'yd5-curl', ejercicioId: 'curl-mancuerna', nombre: 'Curl de bíceps con mancuernas', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 12], incrementoKg: 2, restSeg: 75 },
        { ranuraId: 'yd5-triceps', ejercicioId: 'extension-triceps-polea', nombre: 'Extensión de tríceps en polea', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 2.5, restSeg: 75 },
        { ranuraId: 'yd5-pajaros', ejercicioId: 'pajaros-crossover', nombre: 'Pájaros en crossover', tipoProgresion: 'doble', series: 3, repsObjetivo: [15, 20], incrementoKg: 2.5, restSeg: 60 },
        { ranuraId: 'yd5-estir', ejercicioId: 'estiram-superior', nombre: 'Estiramientos tren superior', tipoProgresion: 'libre', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 30 },
      ],
    },
  ],
};

export const CONFIG_YASMINA: Config = {
  rutinaActivaId: 'rutina-yasmina',
  fechaInicioPlan: '2026-06-18',
  macros: { kcal: 1825, prot: 140, grasa: 65, carbo: 170 },
  puntero: { ultimoDiaCompletadoId: null },
  incrementoMinimoKg: 1.25,
  entrenosObjetivoSemana: 5,
  restTimerActivo: true,
  ultimoExportISO: null,
};
