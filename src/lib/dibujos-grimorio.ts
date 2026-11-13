// Dibujos animados del Grimorio de Yasmina, portados de la maqueta aprobada:
// la bola de cristal con el glifo del día, el gato familiar con sombrero de
// bruja y el gato dormido. SVG en línea (no <use>) para que las animaciones
// CSS de cola, ojos y sombrero lleguen a sus piezas. El CSS va en global.css
// (bloque "Dibujos del Grimorio").

import { svgTrazo } from './iconos-trazo';

export const GATO = `<svg class="gm-gato" viewBox="0 0 64 64" aria-hidden="true">
<path class="gm-cola" d="M44 53c9 1 14-5 12-13-1-4-4-6-6.5-5" fill="none" stroke="#050806" stroke-width="4.5" stroke-linecap="round"/>
<g fill="#050806"><ellipse cx="31" cy="50" rx="14" ry="11.5"/><circle cx="32" cy="31" r="11"/><path d="M22.5 27l-1.5-11 8.5 6.5zM41.5 27l1.5-11-8.5 6.5z"/></g>
<g class="gm-ojos"><ellipse cx="28" cy="31" rx="2.1" ry="2.7" fill="#ecd398"/><ellipse cx="36" cy="31" rx="2.1" ry="2.7" fill="#ecd398"/><ellipse cx="28.3" cy="31.3" rx=".7" ry="1.7" fill="#050806"/><ellipse cx="36.3" cy="31.3" rx=".7" ry="1.7" fill="#050806"/></g>
<path d="M31 35.2h2l-1 1.2z" fill="#d98a8a"/>
<g fill="#d9733b" opacity=".45"><ellipse cx="25" cy="35" rx="2" ry="1.1"/><ellipse cx="39" cy="35" rx="2" ry="1.1"/></g>
<g class="gm-sombrero"><path d="M19 21.5c8 2.5 18 2.5 26 0-3-1.6-6-2.2-8-2.4L33 4c-.6-.9-1.8-.6-1.8.4L26.4 19c-2.4.3-5 1-7.4 2.5z" fill="#1c3226" stroke="#cfae66" stroke-width=".8"/><path d="M26.2 18.6c3.6.8 7.4.8 10.6 0l.5 2c-3.8.9-7.8.9-11.6 0z" fill="#d9733b"/><path d="M33 4c3 0 5 2 6 4.5-2-1-4-1.2-6-1z" fill="#1c3226"/></g>
</svg>`;

export const GATO_DUERME = `<svg class="gm-gato" viewBox="0 0 64 64" aria-hidden="true">
<g fill="#050806"><ellipse cx="32" cy="50" rx="20" ry="10"/><circle cx="18" cy="46" r="9"/><path d="M11 42l-1-8 6 5zM23 40l3-7 1 7z"/></g>
<path d="M50 53c4 1 8-1 8-5" fill="none" stroke="#050806" stroke-width="4" stroke-linecap="round"/>
<g stroke="#ecd398" stroke-width="1.3" fill="none" stroke-linecap="round"><path d="M13 46q2 1.5 4 0M20 46q2 1.5 4 0"/></g>
<g fill="#d9733b" opacity=".45"><ellipse cx="12" cy="50" rx="1.8" ry="1"/><ellipse cx="25" cy="50" rx="1.8" ry="1"/></g>
<text class="gm-zz" x="28" y="34">z</text><text class="gm-zz" x="35" y="26" style="animation-delay:1s">z</text>
</svg>`;

// La bola de cristal con el glifo del día flotando dentro, entre dos nieblas.
export function bolaCristal(glifo: string): string {
  return `<div class="gm-bola" aria-hidden="true">
<div class="gm-esfera"><div class="gm-niebla gm-n1"></div><div class="gm-niebla gm-n2"></div><div class="gm-glifo">${svgTrazo(glifo, 34)}</div><div class="gm-brillo"></div></div>
<svg class="gm-peana" viewBox="0 0 64 18"><defs><linearGradient id="gm-oro" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ecd398"/><stop offset="1" stop-color="#9c7a3c"/></linearGradient></defs><path d="M14 2h36l6 12H8z" fill="url(#gm-oro)"/><rect x="4" y="13" width="56" height="4" rx="2" fill="#7d5f2c"/></svg>
</div>`;
}
