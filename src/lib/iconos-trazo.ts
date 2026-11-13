// Iconos de trazo para el perfil de Yasmina (piel Grimorio). Línea fina de 1,5
// sobre una rejilla de 24, como los de la maqueta aprobada (bóveda:
// 02_LIB/MUSCULO/Yasmina/APP_GRIMORIO/maqueta-grimorio.html). Cada entrada es
// el interior del <svg>; el trazo y el color los pone svgTrazo().

const LUNA =
  '<path stroke-linejoin="round" d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>';
const DESTELLO = (x: number, y: number) =>
  `<path fill="currentColor" stroke="none" d="M${x} ${y - 2}l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>`;

export const TRAZOS: Record<string, string> = {
  // ── Navegación ──
  'nav-hoy': LUNA + DESTELLO(18, 6),
  'nav-entreno':
    '<path d="M5 4.5h11.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11.5"/><path fill="currentColor" stroke-width=".6" d="M11.8 7.2l.8 1.8 1.9.3-1.4 1.3.4 1.9-1.7-1-1.7 1 .4-1.9-1.4-1.3 1.9-.3z"/>',
  'nav-dieta':
    '<path d="M4 10.5h16"/><path d="M5 10.5c0 5 3 8.5 7 8.5s7-3.5 7-8.5"/><path d="M7.5 18.5L6.5 21M16.5 18.5l1 2.5"/><circle cx="10" cy="6.5" r="1.3"/><circle cx="14" cy="4.5" r="1"/><circle cx="13.5" cy="8" r=".7"/>',
  'nav-progreso':
    '<path stroke-width="1.2" stroke-dasharray="2 1.6" d="M4 17l5-6 5 3 6-9"/><circle fill="currentColor" stroke="none" cx="4" cy="17" r="1.8"/><circle fill="currentColor" stroke="none" cx="9" cy="11" r="1.5"/><circle fill="currentColor" stroke="none" cx="14" cy="14" r="1.5"/><path fill="currentColor" stroke="none" d="M20 2.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>',
  ajustes:
    '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/>',
  manana: LUNA + DESTELLO(18, 6),

  // ── Días de la rueda ──
  'dia-gluteo':
    '<path d="M12 7.5c-4-1.2-8 1.8-7 6.8.8 4 4 6 7 6s6.2-2 7-6c1-5-3-8-7-6.8z"/><path d="M12 7.5c-1.2 3-1.2 9 0 12.8M12 7.5c0-2 .8-3.2 2.3-3.8M12.6 5.6c1.6-1.6 4.2-1.5 5.2-.4-1.1 1.6-3.2 2-5.2.4z"/>',
  'dia-hombro': '<circle cx="12" cy="6.5" r="3"/><path d="M4.5 20c0-4.8 3.2-8 7.5-8s7.5 3.2 7.5 8"/><path d="M8.5 13.5c.8 1.6 2 2.4 3.5 2.4s2.7-.8 3.5-2.4"/>',
  'dia-pierna': '<path d="M9.5 3c-.4 3.6.2 6.4 2 8.6 1.4 1.8 1.6 4.6.5 8.4h5.5"/><path d="M14 3c0 2.8.6 4.9 1.8 6.6"/><path d="M12.5 12.2c-1 .3-1.9.2-2.7-.3"/>',
  'dia-cardio': '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l8-8"/>',
  'dia-espalda': '<path d="M6 5c2 2 4 3 6 3s4-1 6-3"/><path d="M6 5l2.5 14h7L18 5"/><path d="M12 8v11"/>',
  'dia-empuje': '<path d="M4 9.5c2.2-2 5.2-2 8 0 2.8-2 5.8-2 8 0"/><path d="M4 9.5c0 5 3.4 7.5 8 7.5s8-2.5 8-7.5"/><path d="M12 9.5V17"/>',
  'dia-brazo': '<path d="M5 19.5c0-4.5 1.3-7.6 3.4-9.8L11.2 5l2.3 1-1.6 3.6c3.6-.2 6.6 2.2 6.6 6v3.9z"/><path d="M9.5 14c1.4-.9 3-1.1 4.6-.6"/>',

  // ── Sesión ──
  record: '<path fill="currentColor" stroke="none" d="M12 2l1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-1.8z"/>',
  descanso: LUNA + '<path d="M15.5 3.5h3l-3 3h3"/>',
  nota: '<path d="M20 4C11 4 6 10 5.5 19.5 9 15 13 12 20 4z"/><path d="M5.5 19.5L4 21M9 14h4.5"/>',
  superserie: '<circle cx="9" cy="12" r="4.8"/><circle cx="15" cy="12" r="4.8"/>',
  energia: '<path d="M13 2.5L5.5 13H11l-1 8.5L18.5 11H13z"/>',
  sueno: '<path d="M4 10.5q8 6.5 16 0"/><path d="M7 13.6l-1.2 2M12 15.2v2.4M17 13.6l1.2 2"/>',
  'rest-timer': '<path d="M7 3h10M7 21h10"/><path d="M8 3v2c0 3 4 5 4 7s-4 4-4 7v2M16 3v2c0 3-4 5-4 7s4 4 4 7v2"/><path d="M10 18.5h4"/>',
  fallo: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 0-6 1-8.5z"/>',
  hecho: '<path stroke-width="2" d="M5 12.5l4.5 4.5L19 7.5"/>',
  aviso: '<path d="M2.5 12S6.3 5.5 12 5.5 21.5 12 21.5 12 17.7 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  alarma: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',

  // ── Progreso y ajustes ──
  medidas: '<circle cx="10" cy="12" r="6"/><circle cx="10" cy="12" r="1.2"/><path d="M16 12h5v3h-7.6"/><path d="M17.8 12v1.4M19.6 12v1.4"/>',
  backup: '<path d="M6 4h10a2 2 0 0 1 2 2v12.5a1.5 1.5 0 0 0 3 0V17h-3"/><path d="M6 4a2 2 0 0 0-2 2v1.5h2"/><path d="M6 4v14a2 2 0 0 0 2 2h11"/><path d="M9.5 9h5M9.5 12h5M9.5 15h3"/>',
  borrar: '<path d="M5 7h14M9.5 7V4.5h5V7"/><path d="M7 7l1 13h8l1-13"/><path d="M10.5 10.5v6M13.5 10.5v6"/>',
  perfil: '<path d="M3.5 18.5c5.5 2 11.5 2 17 0"/><path d="M6.5 18L11.5 3.5c.3-.8 1.3-.8 1.5 0L17.5 18"/><path d="M8.3 13.6c2.4.7 5 .7 7.4 0"/>',
  'import-export': '<path d="M7.5 4v15M3.5 15l4 4 4-4"/><path d="M16.5 20V5M12.5 9l4-4 4 4"/>',

  // ── Comidas ──
  'comida-desayuno': '<path d="M4 9.5h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3.5c0 1.5 1 1.5 1 3M12 3.5c0 1.5 1 1.5 1 3"/>',
  'comida-principal': '<path d="M3 11.5h18a9 9 0 0 1-18 0z"/><path d="M12 11.5c0-3 1.8-5 4.5-5.5-.2 2.8-1.9 4.8-4.5 5.5z"/>',
  'comida-cena': '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 14.2a3.6 3.6 0 0 1-4.9-4.9 3.6 3.6 0 1 0 4.9 4.9z"/>',
  'comida-pregym': '<path d="M12 7.5c-3-2-8-1-8 5 0 5 4 8.7 8 7.8 4 .9 8-2.8 8-7.8 0-6-5-7-8-5z"/><path d="M12 7.5c0-2 1-3.5 3-4.2"/>',
  'comida-snack': '<path d="M5 10.5c0-3.5 3-6 7-6s7 2.5 7 6z"/><path d="M6.5 10.5c0 5 2.5 9 5.5 10 3-1 5.5-5 5.5-10"/><path d="M12 4.5V2.5"/>',
};

export function hayTrazo(id?: string): boolean {
  return !!id && id in TRAZOS;
}

export function svgTrazo(id: string, px: number): string {
  const d = TRAZOS[id];
  if (!d) return '';
  return `<svg class="ico-trazo" viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
