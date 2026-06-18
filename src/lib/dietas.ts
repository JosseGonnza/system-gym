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

const JOSE: DietaPerfil = {
  macros: [
    { valor: '2.900', unidad: 'kcal', color: 'text-vio-hi' },
    { valor: '150 g', unidad: 'proteína', color: 'text-ok' },
    { valor: '70 g', unidad: 'grasa', color: 'text-warn' },
    { valor: '415 g', unidad: 'carbos', color: 'text-vio-soft' },
  ],
  platos: [
    {
      emoji: '🍳',
      nombre: 'Plato 1 — Desayuno motor',
      kcal: '~840 kcal · 35 g prot',
      formula: 'Huevos + carbo lento + fruta',
      detalle: ['4 huevos · 80 g avena (o 2 tostadas de pan bueno) · 1 plátano o fruta', 'Variante salada: huevos + pan + aguacate + tomate'],
    },
    {
      emoji: '🥘',
      nombre: 'Plato 2 — Bowl de batalla',
      kcal: '~850 kcal · 50 g prot',
      formula: '1 puño proteína + 2 puños carbo + verdura + grasa',
      detalle: [
        '180-200 g proteína cocinada · 100 g en seco de arroz/pasta/cuscús (o 300 g patata) · verdura · 1 cda aceite/aguacate/frutos secos',
        'Rotar base: arroz+pollo → pasta+atún → patata+ternera → cuscús+cerdo',
      ],
    },
    {
      emoji: '🐟',
      nombre: 'Plato 3 — Cena ligera con chicha',
      kcal: '~700 kcal · 40 g prot',
      formula: 'Proteína magra + carbo moderado + mucha verdura',
      detalle: [
        '180-200 g pescado blanco/pavo/salmón/huevos · 1 puño carbo · verdura + aceite',
        'Si vengo muy lleno: quitar carbo y doblar proteína + verdura',
      ],
    },
    {
      emoji: '🥤',
      nombre: 'Plato 4 — Salvavidas',
      kcal: '~400 kcal · 28 g prot',
      formula: 'Para los huecos sin parar del curro. 2 minutos.',
      detalle: ['1 scoop proteína + 1 plátano + 1 puñado frutos secos', 'Versión sólida: yogur griego + fruta + frutos secos, o bocadillo de atún/pavo'],
    },
  ],
  resumen: 'Platos 1+2+3+4 ≈ 2.790 kcal · 153 g proteína. Redondear a 2.900 con fruta extra, frutos secos o pan. Clava la proteína y los carbos vienen solos.',
};

const YASMINA: DietaPerfil = {
  macros: [
    { valor: '1.825', unidad: 'kcal', color: 'text-vio-hi' },
    { valor: '140 g', unidad: 'proteína', color: 'text-ok' },
    { valor: '65 g', unidad: 'grasa', color: 'text-warn' },
    { valor: '170 g', unidad: 'carbos', color: 'text-vio-soft' },
  ],
  platos: [
    {
      emoji: '🍳',
      icono: 'comida-desayuno',
      nombre: 'Desayuno (6:00-6:30)',
      formula: 'Proteína + carbo lento + fruta',
      detalle: ['A) Tortilla de 3 huevos + pan de masa madre + kiwi', 'B) Avena (45 g) con bebida sin lactosa + skyr sin lactosa + arándanos + nueces'],
    },
    {
      emoji: '🥪',
      icono: 'comida-snack',
      nombre: 'Media mañana (10:30)',
      formula: 'Fácil de llevar al curro',
      detalle: ['A) Skyr sin lactosa + plátano', 'B) Pavo (lonchas) + mandarina + puñado de almendras'],
    },
    {
      emoji: '🥗',
      icono: 'comida-principal',
      nombre: 'Comida principal (13:00)',
      formula: 'Proteína + carbo de calidad + verdura segura',
      detalle: ['A) Pollo/pavo + arroz + calabacín y zanahoria (aceite de ajo)', 'B) Salmón o pescado blanco + patata + judías verdes'],
    },
    {
      emoji: '🥤',
      icono: 'comida-pregym',
      nombre: 'Pre-gym (17:00)',
      formula: 'Ligero y digerible, para no entrenar vacía',
      detalle: ['A) Plátano + tortita de arroz con pavo', 'B) Yogur sin lactosa + fresas/arándanos'],
    },
    {
      emoji: '🌙',
      icono: 'comida-cena',
      nombre: 'Cena (post-entreno, ~20:00)',
      formula: 'Recupera',
      detalle: ['A) Huevos/tortilla + boniato + espinacas', 'B) Tofu firme o pollo + quinoa + verdura segura'],
    },
  ],
  resumen: 'Proteína en cada comida + carbo de calidad (clave en SOP) + verdura segura. Todo SIN lactosa. Evita sus gatillos: cebolla, ajo, manzana, lechuga, sandía, pimiento, leche entera, queso amarillo.',
};

export const DIETAS: Record<PerfilId, DietaPerfil> = { jose: JOSE, yasmina: YASMINA };

export const dietaDe = (p: PerfilId): DietaPerfil => DIETAS[p];
