// Iconos de la piel Hielo (Jeik): trazo limpio de 1,8 sobre una rejilla de 24,
// como los de la maqueta aprobada (artifact «GYM System · Estéticas», 04 Hielo).
// Cada entrada es el interior del <svg>; el trazo y el color los pone svgHielo().

const LUNA = '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>';

export const HIELO: Record<string, string> = {
  // ── Navegación ──
  'nav-hoy': '<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  'nav-entreno': '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  'nav-comida': '<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 7.5c0-1.4 1.4-1.4 1.4-2.8M14 7.5c0-1.4 1.4-1.4 1.4-2.8"/>',
  'nav-domingo': '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 2.5h6v3H9z"/><path d="M9 13l2 2 4-4"/>',
  'nav-plan': '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  ajustes: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  manana: LUNA,

  // ── Días de la rueda ──
  'dia-empuje': '<path d="M2.5 12h19M5.5 8v8M18.5 8v8M8 9.5v5M16 9.5v5"/>',
  'dia-hombro': '<path d="M12 3v8M8.5 6.5L12 3l3.5 3.5"/><path d="M4.5 21c0-4.4 3.4-7 7.5-7s7.5 2.6 7.5 7"/>',
  'dia-pierna': '<path d="M9 3c.5 4 .5 6 3 8.5S14 17 13 21h4"/><path d="M13.5 3c0 2.5.6 4.3 2 6"/>',
  'dia-espalda': '<path d="M5 5c2.5 1.5 4.5 2 7 2s4.5-.5 7-2"/><path d="M5 5l3 15h8l3-15"/><path d="M12 7v13"/>',
  'dia-cardio': '<path d="M20.5 8.5c0 5.5-8.5 11-8.5 11S3.5 14 3.5 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8.5 2.5z"/><path d="M7 12h2.5l1.5-2.5 2 5 1.5-2.5H17"/>',

  // ── Sesión y avisos ──
  nota: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  record: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4"/><path d="M12 13v4M8.5 21h7M9.5 17h5"/>',
  superserie: '<path d="M17 3l3 3-3 3"/><path d="M4 11V9a3 3 0 0 1 3-3h13"/><path d="M7 21l-3-3 3-3"/><path d="M20 13v2a3 3 0 0 1-3 3H4"/>',
  descanso: LUNA,
  sueno: LUNA,
  energia: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
  hecho: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
  aviso: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5v.01"/>',
  'rest-timer': '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V10M9.5 2.5h5M18.5 6.5L20 5"/>',
  camara: '<path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',

  // ── Ajustes y progreso ──
  perfil: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c0-4.1 3.4-6.5 7.5-6.5s7.5 2.4 7.5 6.5"/>',
  backup: '<path d="M12 3v12M7.5 10.5L12 15l4.5-4.5"/><path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15"/>',
  borrar: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13.5h9l1-13.5M10 11v6M14 11v6"/>',
  medidas: '<path d="M3 16.5L16.5 3 21 7.5 7.5 21z"/><path d="M7 12.5l2 2M10 9.5l2 2M13 6.5l2 2"/>',
  'import-export': '<path d="M7 20V5M3.5 8.5L7 5l3.5 3.5M17 4v15M13.5 15.5L17 19l3.5-3.5"/>',
};

export function hayHielo(id?: string): boolean {
  return !!id && id in HIELO;
}

export function svgHielo(id: string, px: number): string {
  const d = HIELO[id];
  if (!d) return '';
  return `<svg class="ico-hielo" viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
