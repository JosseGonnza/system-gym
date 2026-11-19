// Iconos de línea para el perfil de Jose: el mismo trazo fino de su barra de
// navegación (1,6 sobre rejilla de 24), con el punto lleno como firma.
// Cada entrada es el interior del <svg>; el trazo y el color los pone svgLinea().

const PUNTO = (x: number, y: number, r = 1.1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
const LUNA = '<path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z"/>';
const PESA = '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>';
const PLATO = '<path d="M3 12h18a9 9 0 0 1-18 0z"/><path d="M9 8c0-1.5 1.5-1.5 1.5-3M14 8c0-1.5 1.5-1.5 1.5-3"/>';

export const LINEA: Record<string, string> = {
  // ── Días de la rueda: figuras que sugieren, como antes los puntos ──
  'dia-empuje': `<path d="M4 6h16l-8 13z"/>${PUNTO(12, 10.5)}`,
  'dia-hombro': `<path d="M4 18v-3a8 8 0 0 1 16 0v3"/>${PUNTO(12, 15)}`,
  'dia-pierna': `<path d="M12 5l8 14H4z"/>${PUNTO(12, 14)}`,
  'dia-bombeo': `<path d="M12 3l9 9-9 9-9-9z"/><path d="M12 8l4 4-4 4-4-4z"/>`,
  'dia-espalda': `<path d="M3 6l4 3h10l4-3"/><path d="M7 9l5 10 5-10"/>`,
  'dia-coraza': `<path d="M5 5c2 1.2 4.5 1.8 7 1.8S17 6.2 19 5v6c0 5-3.2 8-7 9.5C8.2 19 5 16 5 11z"/><path d="M8 11.5c1.5.8 2.8.8 4 0 1.2.8 2.5.8 4 0"/>`,
  'dia-alas': `<path d="M12 9C10 6 7 4.5 3 4.5c0 6 3 9.5 7 9.5"/><path d="M12 9c2-3 5-4.5 9-4.5 0 6-3 9.5-7 9.5"/><path d="M12 11v9"/>${PUNTO(12, 7)}`,
  'dia-raices': `<path d="M12 4v5M5 9h14"/><path d="M12 9v11M12 13c-1.5 2-3.5 3-6 5.5M12 13c1.5 2 3.5 3 6 5.5"/>`,
  'dia-bomba': `<circle cx="11" cy="14" r="6.5"/><path d="M15.6 9.4l2-2"/><path d="M19.5 3v1.6M22 6h-1.6M21.3 4.2l-1.1 1.1"/>`,
  'dia-cardio': '<path d="M3 12h4l2-5 4 10 2-5h6"/>',

  // ── La casa ──
  sistema: `<circle cx="12" cy="12" r="8.5" stroke-dasharray="40 7" transform="rotate(-62 12 12)"/>${PUNTO(12, 12, 1.4)}`,
  ajustes: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  perfil: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6"/>',
  backup: '<path d="M5 3.5h11l3.5 3.5v13.5H5z"/><path d="M8 3.5v5h7v-5M8 20.5v-6h8v6"/>',
  'import-export': '<path d="M8 20V5M4.5 8.5L8 5l3.5 3.5M16 4v15M12.5 15.5L16 19l3.5-3.5"/>',
  cambiar: '<path d="M4 9h14l-3.5-3.5M20 15H6l3.5 3.5"/>',
  borrar: '<path d="M4 6.5h16M9.5 6.5V4h5v2.5M6.5 6.5l1 14h9l1-14M10 10.5v6M14 10.5v6"/>',
  bajar: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
  subir: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 20h14"/>',
  camara: '<path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h2.5l1.5-2.5h6L16.5 7H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/><circle cx="12" cy="12.5" r="3.5"/>',

  // ── Estados y datos ──
  descanso: LUNA,
  manana: `${LUNA}${PUNTO(18, 5, 0.9)}`,
  sueno: `${LUNA}<path d="M15 3.5h3.5L15 7h3.5"/>`,
  record: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4"/><path d="M12 13v4M8.5 21h7M9.5 17h5"/>',
  energia: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
  nota: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  alarma: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M4 5.5L7 3M20 5.5L17 3"/>',
  medidas: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v2"/>',
  superserie: '<path d="M17 3l3 3-3 3"/><path d="M4 11V9a3 3 0 0 1 3-3h13"/><path d="M7 21l-3-3 3-3"/><path d="M20 13v2a3 3 0 0 1-3 3H4"/>',
  'rest-timer': '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V10M10 2.5h4M12 2.5V6M18.5 6.5L20 5"/>',
  fallo: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.5 2.6-5.3 3.8-8.8 1.8 1.3 2.6 3 2.6 4.6 1-.8 1.6-2 1.7-3.4 2.4 1.9 4.9 4.7 4.9 7.6 0 3.6-2.6 6.2-6.5 6.2z"/>',
  previsto: `<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/>${PUNTO(12, 12)}`,
  aviso: `<path d="M12 3.5L21.5 20h-19z"/><path d="M12 10v4.5"/>${PUNTO(12, 17.3, 0.9)}`,
  hecho: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.8 2.7L16 9.5"/>',
  agarre: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 6.5-6 6.5-2.5 0-4-1.3-5.2-3.4L4.3 14a1.4 1.4 0 0 1 2.4-1.4L8 14.5"/>',
  gota: '<path d="M12 3.5s6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5z"/>',
  pesa: PESA,
  plato: PLATO,

  // ── Mandos de la sesión ──
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  pausa: '<path d="M9 5.5v13M15 5.5v13"/>',
  parar: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/>',
  meta: '<path d="M5 21V4M5 4.5h12l-2.5 4 2.5 4H5"/>',

  // ── Jornadas ──
  'jor-laboratorio': '<path d="M7.5 4C5 4 4 6 4 8.5c0 3 1.5 4.5 2 7.5.4 2.5 1 4.5 2.2 4.5 1.5 0 1.5-5 3.8-5s2.3 5 3.8 5c1.2 0 1.8-2 2.2-4.5.5-3 2-4.5 2-7.5C20 6 19 4 16.5 4c-1.8 0-2.7 1-4.5 1S9.3 4 7.5 4z"/>',
  'jor-ett': '<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18.5 4.5L21 7l-2.5 2.5M18.5 14.5L21 17l-2.5 2.5"/>',
  'jor-libre': '<path d="M3 18h18M7.5 18a4.5 4.5 0 0 1 9 0M12 7.5v2M5.5 10.5l1.4 1.4M18.5 10.5l-1.4 1.4"/>',
};

export const hayLinea = (id?: string): boolean => !!id && id in LINEA;

export function svgLinea(id: string, px: number): string {
  const d = LINEA[id];
  if (!d) return '';
  return `<svg class="ico-linea" viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}

// Emojis que aparecen sueltos en textos y botones. Los que no están aquí se quitan.
const GLIFOS: Record<string, string> = {
  '▶': 'play', '⏸': 'pausa', '⏹': 'parar', '🏁': 'meta',
  '🗑': 'borrar', '🧨': 'borrar', '💾': 'backup', '🔄': 'cambiar', '⬇': 'bajar', '⬆': 'subir',
  '⚠': 'aviso', '😴': 'descanso', '✅': 'hecho', '✔': 'hecho', '⏱': 'rest-timer', '⏰': 'alarma',
  '🤚': 'agarre', '🔥': 'fallo', '💧': 'gota', '💡': 'nota', '📷': 'camara', '🏆': 'record',
  '🏋': 'pesa', '💪': 'pesa', '🍳': 'plato', '🥘': 'plato', '🐟': 'plato', '🥤': 'plato', '🍽': 'plato', '🥗': 'plato',
};

const EMOJI = /\p{Extended_Pictographic}️?/gu;

// Parte un texto en trozos: texto suelto o { icono }. null si no lleva emojis.
export function partirGlifos(txt: string): (string | { icono: string })[] | null {
  if (!txt.match(EMOJI)) return null;
  const out: (string | { icono: string })[] = [];
  let resto = 0;
  for (const m of txt.matchAll(EMOJI)) {
    out.push(txt.slice(resto, m.index));
    const icono = GLIFOS[m[0].replace('️', '')];
    if (icono) out.push({ icono });
    resto = m.index! + m[0].length;
  }
  out.push(txt.slice(resto));
  const limpio = out.map((t) => (typeof t === 'string' ? t.replace(/\s+/g, ' ') : t)).filter((t) => t !== '');
  limpio.forEach((t, i) => {
    if (typeof t !== 'string') return;
    if (i === 0 || typeof limpio[i - 1] !== 'string') t = t.trimStart();
    if (i === limpio.length - 1) t = t.trimEnd();
    limpio[i] = t;
  });
  return limpio.filter((t) => t !== '');
}
