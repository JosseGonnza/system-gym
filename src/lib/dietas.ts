import type { PerfilId } from './types';

export interface Macro {
  valor: string;
  unidad: string;
  color: string;
}

export interface Plato {
  emoji: string;
  icono?: string;
  nombre: string;
  kcal?: string;
  formula: string;
  detalle: string[];
}

export interface DietaPerfil {
  macros: Macro[];
  platos: Plato[];
  resumen: string;
}

const JEIK: DietaPerfil = {
  macros: [
    { valor: '2.300', unidad: 'kcal', color: 'text-vio-hi' },
    { valor: '150 g', unidad: 'proteína', color: 'text-ok' },
    { valor: '70 g', unidad: 'grasa', color: 'text-warn' },
    { valor: '265 g', unidad: 'hidratos', color: 'text-vio-soft' },
  ],
  platos: [
    {
      emoji: '☕',
      nombre: 'Desayuno',
      kcal: '~250 kcal · 15 g prot',
      formula: 'Muy ligero',
      detalle: ['A) Café con leche y tostada con pavo', 'B) Yogur 0 % con plátano y avena', 'C) Queso batido con avena', 'D) Café con leche y un plátano'],
    },
    {
      emoji: '🍽️',
      nombre: 'Comida',
      kcal: '~900 kcal · 60 g prot',
      formula: 'Dos palmas generosas de proteína + 2 puños y medio de hidrato cocinado + verdura',
      detalle: ['Proteína: pollo, pavo, ternera magra, pescado blanco o huevos', 'Hidrato: arroz, pasta, patata o legumbre', 'Media cucharada de aceite'],
    },
    {
      emoji: '🌙',
      nombre: 'Cena',
      kcal: '~750 kcal · 55 g prot',
      formula: 'Unas 2 palmas de proteína + puño y medio de hidrato cocinado + mucha verdura',
      detalle: ['Pescado blanco, pollo, lomo o tortilla', 'Patata, arroz o pan'],
    },
    {
      emoji: '🥜',
      nombre: 'Snack libre',
      kcal: '~400 kcal en el día',
      formula: 'Tu hueco para lo que comas fuera de los tres bloques',
      detalle: ['Fruta, yogur 0 %, pavo, batido de proteína, un bocadillo pequeño'],
    },
  ],
  resumen: 'Lo que cuenta es llegar a la proteína. Si un día sales de fiesta, al día siguiente vuelves al plan sin compensar.',
};

// Jose y Yasmina llevan la dieta de casa (lib/casa); esta es la fija de Jeik.
export const DIETAS: Partial<Record<PerfilId, DietaPerfil>> = { jeik: JEIK };

export const dietaDe = (p: PerfilId): DietaPerfil | undefined => DIETAS[p];
