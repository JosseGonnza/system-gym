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
  { id: 'fondos-paralelas', nombre: 'Fondos en paralelas', patron: 'empujeH', implemento: 'corporal', entrada: 'lastre', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Codos en frío con cuidado, sin bloquear del todo' },
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
  // — Llegados con los backups (Arnold, cardio por máquina, core) —
  { id: 'press-banca-maquina', nombre: 'Press banca en máquina', patron: 'empujeH', implemento: 'maquina', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'press-inclinado-maquina', nombre: 'Press inclinado en máquina', patron: 'empujeH', implemento: 'maquina', entrada: 'porLado', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'elevacion-lateral-polea', nombre: 'Elevación lateral en polea', patron: 'aislamiento', implemento: 'polea', entrada: 'directa', ejecucion: 'unilateral', pesoBaseKg: 0, nota: 'Un brazo cada vez, polea baja. Meñique alto, no pasar del hombro' },
  { id: 'remo-maquina-brazo', nombre: 'Remo en máquina por brazo', patron: 'traccionH', implemento: 'maquina', entrada: 'directa', ejecucion: 'unilateral', pesoBaseKg: 0, nota: 'Un brazo cada vez. La máquina suma ~5,5 kg de resistencia propia' },
  { id: 'curl-polea-cuerda', nombre: 'Curl en polea baja con cuerda', patron: 'aislamiento', implemento: 'polea', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'gemelo-pie', nombre: 'Elevación de gemelo de pie', patron: 'aislamiento', implemento: 'multipower', entrada: 'porLado', ejecucion: 'bilateral', pesoBaseKg: 0 },
  { id: 'hiperextension', nombre: 'Hiperextensiones (banco romano)', patron: 'cadera', implemento: 'corporal', entrada: 'lastre', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Parar en línea recta, sin hiperextender arriba. Sin peso las primeras semanas' },
  { id: 'crunch-polea', nombre: 'Crunch en polea alta', patron: 'core', implemento: 'polea', entrada: 'directa', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'De rodillas, redondeando la espalda alta. Acortar el abdomen, no tirar con los brazos' },
  { id: 'crunch-declinado', nombre: 'Crunch en banco declinado', patron: 'core', implemento: 'corporal', entrada: 'lastre', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Cabeza abajo y pies enganchados. Sube enrollando la espalda, sin tirar del cuello' },
  { id: 'cardio-eliptica', nombre: 'Elíptica', patron: 'cardio', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Sin impacto. Buena opción si la rodilla anda sensible' },
  { id: 'cardio-bici', nombre: 'Bicicleta estática', patron: 'cardio', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Sillín alto para no cerrar mucho la rodilla' },
  { id: 'cardio-caminar', nombre: 'Caminar', patron: 'cardio', implemento: 'corporal', entrada: 'ninguna', ejecucion: 'bilateral', pesoBaseKg: 0, nota: 'Cuenta igual. La constancia gana a la intensidad' },
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
      nombre: 'Pecho',
      emoji: '💪',
      ejercicios: [
        { ranuraId: 'd2-banca', ejercicioId: 'press-banca', nombre: 'Press banca (multipower)', tipoProgresion: 'lineal', series: 4, repsObjetivo: 5, incrementoKg: 2.5, restSeg: 180 },
        { ranuraId: 'd2-inclinado', ejercicioId: 'press-inclinado-mancuerna', nombre: 'Press inclinado con mancuernas', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2, restSeg: 90 },
        { ranuraId: 'd2-pecdeck', ejercicioId: 'pec-deck', nombre: 'Aperturas en pec deck', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 5, restSeg: 75 },
        { ranuraId: 'd2-fondos', ejercicioId: 'fondos-paralelas', nombre: 'Fondos en paralelas', tipoProgresion: 'pesoCorporal', series: 3, repsObjetivo: [8, 12], incrementoKg: 2.5, restSeg: 90, nota: 'Codos en frío con cuidado, sin bloquear del todo' },
        { ranuraId: 'd2-triceps', ejercicioId: 'extension-triceps-polea', nombre: 'Extensión de tríceps en polea', tipoProgresion: 'doble', series: 3, repsObjetivo: [10, 15], incrementoKg: 2.5, restSeg: 75 },
      ],
    },
    {
      id: 'd3',
      nombre: 'Espalda',
      emoji: '🔙',
      ejercicios: [
        { ranuraId: 'd3-jalon', ejercicioId: 'jalon-pecho', nombre: 'Jalón al pecho', tipoProgresion: 'doble', series: 4, repsObjetivo: [6, 10], incrementoKg: 5, restSeg: 120 },
        { ranuraId: 'd3-remo', ejercicioId: 'remo-polea', nombre: 'Remo en polea baja', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'd3-remo-maquina', ejercicioId: 'remo-maquina', nombre: 'Remo en máquina (apoyo de pecho)', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'd3-curl', ejercicioId: 'curl-z', nombre: 'Curl de bíceps con barra Z', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 1.25, restSeg: 75 },
        { ranuraId: 'd3-curl-mancuerna', ejercicioId: 'curl-mancuerna', nombre: 'Curl de bíceps con mancuernas', tipoProgresion: 'doble', series: 3, repsObjetivo: [8, 12], incrementoKg: 2, restSeg: 75 },
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
        { ranuraId: 'd4-facepulls', ejercicioId: 'face-pull', nombre: 'Face pull en crossover', tipoProgresion: 'doble', series: 3, repsObjetivo: [15, 20], incrementoKg: 2.5, restSeg: 60 },
        { ranuraId: 'd4-trapecio', ejercicioId: 'encogimiento-trapecio', nombre: 'Encogimientos de trapecio', tipoProgresion: 'doble', series: 3, repsObjetivo: [12, 15], incrementoKg: 2, restSeg: 75 },
      ],
    },
    {
      id: 'd5',
      nombre: 'Pierna posterior',
      emoji: '🦾',
      ejercicios: [
        { ranuraId: 'd5-femoral', ejercicioId: 'curl-femoral', nombre: 'Curl femoral sentado', tipoProgresion: 'doble', series: 4, repsObjetivo: [10, 15], incrementoKg: 5, restSeg: 90 },
        { ranuraId: 'd5-gluteo', ejercicioId: 'patada-gluteo', nombre: 'Patada de glúteo', tipoProgresion: 'doble', series: 4, repsObjetivo: [12, 15], incrementoKg: 5, restSeg: 75, nota: 'Por pierna' },
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
// Full body de otoño (21/10/2026): dos días que se alternan y un día suave de
// cardio que no mueve la rueda. Máquinas, cuidando rodillas (condromalacia) y
// hombro (tendinitis). Las ranuras que ya existían conservan su id: así arranca
// con sus últimos pesos en vez de calibrar de cero.
const INTRO_FUERZA = 'Calienta 5 minutos en la cinta o la elíptica, suave. Luego, ejercicio a ejercicio: aquí tienes todo.';

export const RUTINA_YASMINA: Rutina = {
  id: 'rutina-yasmina-otono',
  nombre: 'Full body · 3 días + día suave',
  dias: [
    {
      id: 'fa',
      nombre: 'Full body A',
      emoji: '🍑',
      icono: 'dia-gluteo',
      intro: INTRO_FUERZA,
      ejercicios: [
        { ranuraId: 'yd1-hipthrust', ejercicioId: 'hip-thrust', nombre: 'Hip thrust', tipoProgresion: 'sensacion', series: 3, repsObjetivo: 12, incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'yd1-prensa', ejercicioId: 'prensa-horizontal', nombre: 'Prensa horizontal', tipoProgresion: 'sensacion', series: 3, repsObjetivo: 12, incrementoKg: 5, restSeg: 90, nota: 'Sin bajar tanto que pinche la rodilla' },
        { ranuraId: 'yd2-press', ejercicioId: 'press-banca-maquina', nombre: 'Press de pecho en máquina', tipoProgresion: 'sensacion', series: 3, repsObjetivo: 12, incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'yd2-jalon', ejercicioId: 'jalon-pecho', nombre: 'Jalón al pecho', tipoProgresion: 'sensacion', series: 3, repsObjetivo: 12, incrementoKg: 2.5, restSeg: 90, nota: 'Tira con los codos, no con las manos' },
        { ranuraId: 'yd3-plancha', ejercicioId: 'plancha', nombre: 'Plancha', tipoProgresion: 'tiempo', series: 3, repsObjetivo: null, incrementoKg: null, restSeg: 60, segObjetivo: 30, nota: 'Dale a ▶ y la app te cuenta los 30 segundos' },
      ],
    },
    {
      id: 'fb',
      nombre: 'Full body B',
      emoji: '🦵',
      icono: 'dia-pierna',
      intro: INTRO_FUERZA,
      ejercicios: [
        { ranuraId: 'yd1-femoral', ejercicioId: 'curl-femoral', nombre: 'Curl femoral sentado', tipoProgresion: 'sensacion', series: 3, repsObjetivo: 12, incrementoKg: 2.5, restSeg: 90 },
        { ranuraId: 'yd1-gluteo', ejercicioId: 'patada-gluteo', nombre: 'Patada de glúteo', tipoProgresion: 'sensacion', series: 3, repsObjetivo: 12, incrementoKg: 2.5, restSeg: 60, nota: 'Cada pierna hace sus 12' },
        { ranuraId: 'y-extension', ejercicioId: 'extension-cuadriceps', nombre: 'Extensión de cuádriceps', tipoProgresion: 'sensacion', series: 3, repsObjetivo: 12, incrementoKg: 2.5, restSeg: 60, nota: 'Solo el tramo final, con la rodilla casi estirada' },
        { ranuraId: 'yd2-remo', ejercicioId: 'remo-maquina', nombre: 'Remo en máquina', tipoProgresion: 'sensacion', series: 3, repsObjetivo: 12, incrementoKg: 2.5, restSeg: 90, nota: 'Junta los omóplatos antes de doblar los codos' },
        { ranuraId: 'yd3-deadbug', ejercicioId: 'dead-bug', nombre: 'Dead bug', tipoProgresion: 'sensacion', series: 3, repsObjetivo: 10, incrementoKg: null, restSeg: 45, nota: '10 por lado, despacio' },
      ],
    },
    {
      id: 'ysuave',
      nombre: 'Día suave',
      emoji: '🍂',
      icono: 'dia-cardio',
      fueraDeRueda: true,
      intro: 'Elige máquina y tiempo, y a tu ritmo. Hoy cuenta igual que un día de fuerza.',
      ejercicios: [
        { ranuraId: 'yd3-cardio', ejercicioId: 'cardio-cinta', nombre: 'Cinta inclinada', tipoProgresion: 'tiempo', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 0 },
        { ranuraId: 'y-cardio-eliptica', ejercicioId: 'cardio-eliptica', nombre: 'Elíptica', tipoProgresion: 'tiempo', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 0 },
        { ranuraId: 'y-cardio-caminar', ejercicioId: 'cardio-caminar', nombre: 'Caminar', tipoProgresion: 'tiempo', series: 1, repsObjetivo: null, incrementoKg: null, restSeg: 0 },
      ],
    },
  ],
};

export const CONFIG_YASMINA: Config = {
  rutinaActivaId: RUTINA_YASMINA.id,
  fechaInicioPlan: '2026-06-18',
  macros: { kcal: 1825, prot: 140, grasa: 65, carbo: 170 },
  puntero: { ultimoDiaCompletadoId: null },
  incrementoMinimoKg: 1.25,
  entrenosObjetivoSemana: 3,
  restTimerActivo: true,
  ultimoExportISO: null,
};
