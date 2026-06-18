import type { Jornada, PerfilId } from './types';

export interface FilaPauta {
  hora: string;
  texto: string;
  destacado?: boolean;
}

export interface JornadaDef {
  id: Jornada;
  label: string;
  emoji: string;
}

export interface HorarioPerfil {
  jornadas: JornadaDef[];
  alarmas: Partial<Record<Jornada, string>>;
  pautas: Partial<Record<Jornada, FilaPauta[]>>;
}

// ───────────────────────────── Jose ─────────────────────────────
const JOSE: HorarioPerfil = {
  jornadas: [
    { id: 'manana', label: 'Mañana', emoji: '🌅' },
    { id: 'tarde', label: 'Tarde', emoji: '🌇' },
    { id: 'libre', label: 'Libre', emoji: '🏖️' },
  ],
  alarmas: { manana: '5:30', tarde: '8:00', libre: '8:00' },
  pautas: {
    manana: [
      { hora: '5:30', texto: 'Despertar' },
      { hora: '5:40', texto: 'Pre-entreno: plátano + café + ½ scoop whey' },
      { hora: '5:55', texto: '🏋️ ENTRENO — calentar MÁS de lo normal', destacado: true },
      { hora: '7:00', texto: 'Ducha y al curro' },
      { hora: '8:00', texto: '🍳 Plato 1 — Desayuno motor (post-entreno)' },
      { hora: '~11/16', texto: '🥘 Plato 2 — comida del personal' },
      { hora: '18:30', texto: 'Plato 2 o merienda fuerte (si el personal cayó pronto)' },
      { hora: '21:00', texto: '🐟 Plato 3 — Cena' },
      { hora: '21:30', texto: '😴 A LA CAMA — sagrado', destacado: true },
    ],
    tarde: [
      { hora: '8:00', texto: 'Despertar' },
      { hora: '8:15', texto: 'Pre-entreno: plátano + café + ½ scoop whey' },
      { hora: '9:00', texto: '🏋️ ENTRENO — gym vacío, fresco y descansado', destacado: true },
      { hora: '10:30', texto: '🍳 Plato 1 — Desayuno motor (post-entreno)' },
      { hora: '12/13', texto: 'Entro a trabajar' },
      { hora: '~16:30', texto: '🥘 Plato 2 — comida del personal' },
      { hora: '19/20', texto: 'Salgo del curro' },
      { hora: '21:00', texto: '🐟 Plato 3 — Cena' },
    ],
    libre: [
      { hora: '8:00', texto: 'Despertar' },
      { hora: '8:15', texto: 'Pre-entreno: plátano + café + ½ scoop whey' },
      { hora: '9:00', texto: '🏋️ ENTRENO', destacado: true },
      { hora: '10:30', texto: '🍳 Plato 1 — Desayuno motor (post-entreno)' },
      { hora: '14:00', texto: '🥘 Plato 2 — Bowl de batalla' },
      { hora: '18:00', texto: '🥤 Plato 4 o merienda' },
      { hora: '21:00', texto: '🐟 Plato 3 — Cena' },
      { hora: '22:30', texto: '😴 A la cama' },
    ],
  },
};

// ──────────────────────────── Yasmina ───────────────────────────
const YASMINA: HorarioPerfil = {
  jornadas: [
    { id: 'laboratorio', label: 'Laboratorio', emoji: '🦷' },
    { id: 'ett', label: 'ETT', emoji: '🔀' },
    { id: 'libre', label: 'Libre', emoji: '🏖️' },
  ],
  alarmas: { laboratorio: '6:00', libre: '7:00', ett: 'según turno' },
  pautas: {
    laboratorio: [
      { hora: '6:00', texto: 'Despertar' },
      { hora: '6:15', texto: '🍳 Desayuno fuerte (tortilla o avena sin lactosa)' },
      { hora: '10:30', texto: 'Media mañana (skyr sin lactosa + fruta)' },
      { hora: '13:00', texto: '🍽️ Comida principal' },
      { hora: '17:00', texto: 'Pre-gym ligero (plátano + tortita de arroz con pavo)' },
      { hora: '18:00', texto: '🏋️ ENTRENO', destacado: true },
      { hora: '20:00', texto: '🥗 Cena post-entreno' },
      { hora: '22:30', texto: '😴 A la cama' },
    ],
    libre: [
      { hora: '7:00', texto: 'Despertar' },
      { hora: '7:15', texto: 'Pre-entreno: plátano + yogur sin lactosa' },
      { hora: '7:30', texto: '🏋️ ENTRENO — gym vacío y fresca', destacado: true },
      { hora: '9:00', texto: '🍳 Desayuno post-entreno' },
      { hora: '13:00', texto: '🍽️ Comida principal' },
      { hora: '17:30', texto: 'Merienda con proteína' },
      { hora: '20:30', texto: '🥗 Cena' },
    ],
    ett: [
      { hora: 'Turno', texto: 'Mañana o tarde, variable. El día más raro.' },
      { hora: '—', texto: 'Asegura desayuno, comida y cena con proteína' },
      { hora: '—', texto: 'Pre-gym ligero si vas a entrenar' },
      { hora: 'Flex', texto: '🏋️ ENTRENO cuando el turno lo permita (o descanso)', destacado: true },
    ],
  },
};

export const HORARIOS: Record<PerfilId, HorarioPerfil> = { jose: JOSE, yasmina: YASMINA };

export const horarioDe = (p: PerfilId): HorarioPerfil => HORARIOS[p];
