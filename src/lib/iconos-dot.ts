// Iconos de matriz de puntos para el perfil de Jose (tema Nothing).
// Cada icono es una rejilla 7×7: '#' = punto encendido. Se leen como pixel art,
// que es justo lo que son. Abstractos a propósito: sugieren, no dibujan.

export const PATRONES: Record<string, string[]> = {
  // ── Navegación ──
  'nav-hoy': [
    '.......',
    '#######',
    '#.....#',
    '#..#..#',
    '#.....#',
    '#######',
    '.......',
  ],
  'nav-entreno': [
    '.......',
    '.......',
    '##.#.##',
    '#######',
    '##.#.##',
    '.......',
    '.......',
  ],
  'nav-dieta': [
    '.......',
    '.#...#.',
    '.#...#.',
    '#######',
    '.#####.',
    '..###..',
    '.......',
  ],
  'nav-progreso': [
    '.......',
    '.....#.',
    '...#.#.',
    '...#.#.',
    '.#.#.#.',
    '.#.#.#.',
    '.......',
  ],

  // ── Días de rutina: cuatro figuras geométricas, una por día ──
  // Triángulo hacia abajo = la V del torso.
  'dia-empuje': [
    '.......',
    '#######',
    '.#####.',
    '.#####.',
    '..###..',
    '...#...',
    '.......',
  ],
  // Media luna con las puntas abajo = la curva del deltoides.
  'dia-hombro': [
    '.......',
    '..###..',
    '.##.##.',
    '##...##',
    '#.....#',
    '#.....#',
    '.......',
  ],
  // Triángulo hacia arriba = base ancha, la pierna.
  'dia-pierna': [
    '.......',
    '...#...',
    '..###..',
    '.#####.',
    '.#####.',
    '#######',
    '.......',
  ],
  // Rombo = congestión, expansión desde el centro.
  'dia-bombeo': [
    '...#...',
    '..###..',
    '.#####.',
    '#######',
    '.#####.',
    '..###..',
    '...#...',
  ],
  'dia-espalda': [
    '.......',
    '##...##',
    '###.###',
    '#######',
    '.#####.',
    '..###..',
    '.......',
  ],
  'dia-cardio': [
    '.##.##.',
    '#######',
    '#######',
    '#######',
    '.#####.',
    '..###..',
    '...#...',
  ],

  // ── Estados y datos ──
  descanso: [
    '.......',
    '.#####.',
    '....##.',
    '...##..',
    '..##...',
    '.#####.',
    '.......',
  ],
  record: [
    '#######',
    '.#####.',
    '.#####.',
    '..###..',
    '...#...',
    '..###..',
    '.#####.',
  ],
  energia: [
    '...##..',
    '..##...',
    '.###...',
    '.#####.',
    '...##..',
    '..##...',
    '.##....',
  ],
  sueno: [
    '.......',
    '..####.',
    '.#####.',
    '.#####.',
    '.####..',
    '..##...',
    '.......',
  ],
  nota: [
    '.......',
    '.#####.',
    '.......',
    '.#####.',
    '.......',
    '.###...',
    '.......',
  ],
  alarma: [
    '.#...#.',
    '.#####.',
    '#..#..#',
    '#..###.',
    '#.....#',
    '.#####.',
    '..#.#..',
  ],
  medidas: [
    '.......',
    '#######',
    '#.#.#.#',
    '#.#.#.#',
    '#.#.#.#',
    '#######',
    '.......',
  ],
  superserie: [
    '.......',
    '..###..',
    '.#...#.',
    '#..#..#',
    '.#...#.',
    '..###..',
    '.......',
  ],
  'rest-timer': [
    '.......',
    '.#####.',
    '#..#..#',
    '#..#..#',
    '#..##.#',
    '.#####.',
    '.......',
  ],
  ajustes: [
    '.#.#.#.',
    '.#####.',
    '##...##',
    '#..#..#',
    '##...##',
    '.#####.',
    '.#.#.#.',
  ],
  fallo: [
    '.......',
    '.#...#.',
    '..#.#..',
    '...#...',
    '..#.#..',
    '.#...#.',
    '.......',
  ],
  backup: [
    '.......',
    '#######',
    '#.....#',
    '#.###.#',
    '#.###.#',
    '#######',
    '.......',
  ],
  'import-export': [
    '...#...',
    '..###..',
    '.#.#.#.',
    '...#...',
    '...#...',
    '.......',
    '#######',
  ],
  perfil: [
    '.......',
    '..###..',
    '..###..',
    '.......',
    '.#####.',
    '#######',
    '.......',
  ],
  previsto: [
    '.......',
    '..#....',
    '..##...',
    '..###..',
    '..##...',
    '..#....',
    '.......',
  ],
  // Rotar la rueda: flechas encontradas.
  cambiar: [
    '.......',
    '..####.',
    '.#....#',
    '.#...#.',
    '#....#.',
    '.####..',
    '.......',
  ],
  // Mañana: luna menguante.
  manana: [
    '..###..',
    '.##..#.',
    '.#.....',
    '.#.....',
    '.#.....',
    '.##..#.',
    '..###..',
  ],
  aviso: [
    '...#...',
    '...#...',
    '..###..',
    '..#.#..',
    '.##.##.',
    '.#####.',
    '...#...',
  ],
  hecho: [
    '.......',
    '.....##',
    '....##.',
    '#..##..',
    '##.#...',
    '.##....',
    '.......',
  ],
};

export function hayPatron(id?: string): boolean {
  return !!id && id in PATRONES;
}

const CELDA = 3;
const RADIO = 1.15;
const LADO = 7 * CELDA; // 21

// Devuelve el markup del SVG. Usa currentColor, así hereda el color del texto.
export function svgDot(id: string, px: number): string {
  const filas = PATRONES[id];
  if (!filas) return '';
  const puntos: string[] = [];
  filas.forEach((fila, y) => {
    [...fila].forEach((c, x) => {
      if (c !== '#') return;
      const cx = x * CELDA + CELDA / 2;
      const cy = y * CELDA + CELDA / 2;
      puntos.push(`<circle cx="${cx}" cy="${cy}" r="${RADIO}"/>`);
    });
  });
  return `<svg class="ico-dot" viewBox="0 0 ${LADO} ${LADO}" width="${px}" height="${px}" fill="currentColor" aria-hidden="true">${puntos.join('')}</svg>`;
}
