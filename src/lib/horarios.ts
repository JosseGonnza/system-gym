import type { Jornada } from './types';

export interface FilaPauta {
  hora: string;
  texto: string;
  destacado?: boolean;
}

export const JORNADAS: { id: Jornada; label: string; emoji: string }[] = [
  { id: 'manana', label: 'Mañana', emoji: '🌅' },
  { id: 'tarde', label: 'Tarde', emoji: '🌇' },
  { id: 'libre', label: 'Libre', emoji: '🏖️' },
];

export const ALARMAS: Record<Jornada, string> = {
  manana: '5:30',
  tarde: '8:00',
  libre: '8:00',
};

export const PAUTAS: Record<Jornada, FilaPauta[]> = {
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
};
