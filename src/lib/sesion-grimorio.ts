// La sesión de entreno de Yasmina, vestida de Grimorio: se apoya en la tarjeta
// del modo sencillo de entreno.astro (misma lógica, mismo guardado) y solo le
// cambia la ropa. entreno.astro carga este módulo con import dinámico.

import type { Sensacion } from './types';

export { capitulos } from './grimorio';

const RUNA =
  '<svg class="gm-runa" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" stroke-width=".6" stroke-dasharray="1 5"/><g fill="currentColor"><path d="M100 0l3 8-3 4-3-4z"/><path d="M100 200l3-8-3-4-3 4z"/><path d="M0 100l8 3 4-3-4-3z"/><path d="M200 100l-8 3-4-3 4-3z"/><circle cx="168" cy="32" r="2"/><circle cx="32" cy="168" r="2"/><circle cx="32" cy="32" r="2"/><circle cx="168" cy="168" r="2"/></g></svg>';

// Caritas de gato para "¿Qué tal te ha ido?" (fácil, bien, duro)
const OREJAS_CARA =
  '<path d="M7 14L6 3l9 6M33 14l1-11-9 6"/><path d="M6 15c0-6 6-8 14-8s14 2 14 8c0 9-6 15-14 15S6 24 6 15z"/>';
const cara = (dentro: string, fuera = '') =>
  `<svg class="gm-cara-svg" viewBox="0 0 40 36" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${OREJAS_CARA}${dentro}</g>${fuera}</svg>`;

export const CARAS: Record<Sensacion, string> = {
  facil: cara(
    '<path d="M12 17q2.5-3 5 0M23 17q2.5-3 5 0"/><path d="M17 22q3 3 6 0"/>',
    '<g fill="#d9733b" opacity=".55"><ellipse cx="11" cy="21" rx="2.4" ry="1.4"/><ellipse cx="29" cy="21" rx="2.4" ry="1.4"/></g>',
  ),
  bien: cara('<path d="M18 22.5q2 1.5 4 0"/>', '<g fill="currentColor"><circle cx="14.5" cy="16.5" r="1.8"/><circle cx="25.5" cy="16.5" r="1.8"/></g>'),
  duro: cara('<path d="M12 14.5l4 2-4 2M28 14.5l-4 2 4 2"/><path d="M16 24q4-3 8 0"/>'),
};

// Avance de la sesión en lunas: llena = hecho, media en cobre = el de ahora,
// hueco = pendiente. Cada luna es un botón que lleva a ese ejercicio.
export type EstadoLuna = 'llena' | 'actual' | 'vacia';

const LUNA: Record<EstadoLuna, string> = {
  llena: '<circle cx="12" cy="12" r="9" fill="#cfae66"/>',
  actual: '<circle cx="12" cy="12" r="9" fill="none" stroke="#ee9a5f" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="#ee9a5f"/>',
  vacia: '<circle cx="12" cy="12" r="9" fill="none" stroke="rgb(207 174 102 / .3)" stroke-width="1.5"/>',
};

export function lunasAvance(estados: EstadoLuna[], nombres: string[], alTocar: (i: number) => void): HTMLElement {
  const cont = document.createElement('div');
  cont.className = 'gm-avance';
  estados.forEach((e, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `gm-avance-luna${e === 'actual' ? ' gm-late' : ''}`;
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${LUNA[e]}</svg>`;
    b.setAttribute('aria-label', `${nombres[i]}${e === 'llena' ? ', hecho' : e === 'actual' ? ', ahora' : ''}`);
    if (e === 'actual') b.setAttribute('aria-current', 'step');
    b.addEventListener('click', () => alTocar(i));
    cont.append(b);
  });
  return cont;
}

// El peso dentro del círculo rúnico, con − y + a los lados. La fila la monta
// entreno.astro: [botón −, centro (input + unidad), botón +].
export function vestirCirculo(fila: HTMLElement): void {
  fila.className = 'gm-circulo';
  fila.insertAdjacentHTML('afterbegin', RUNA);
  const [menos, mas] = fila.querySelectorAll('button');
  menos.className = 'gm-ajuste gm-menos';
  mas.className = 'gm-ajuste gm-mas';
  const input = fila.querySelector('input');
  if (input) input.className = 'num gm-kg';
  const unidad = input?.nextElementSibling;
  if (unidad) unidad.className = 'gm-kg-sub';
}

// Las series como círculos; la hecha, moneda de oro con su número.
export function vestirSeries(fila: HTMLElement): void {
  fila.className = 'gm-series';
  fila.firstElementChild?.remove();
  const circulos = fila.firstElementChild as HTMLElement | null;
  if (!circulos) return;
  circulos.className = 'gm-series-circulos';
  circulos.querySelectorAll('button').forEach((b, i) => {
    const hecha = b.getAttribute('aria-label')?.endsWith(', hecha') ?? false;
    b.className = `gm-serie${hecha ? ' gm-hecha' : ''}`;
    b.textContent = String(i + 1);
  });
}

// El crono del cardio, dentro del mismo círculo rúnico que el peso.
export function vestirReloj(reloj: HTMLElement): void {
  const [tiempo, sub] = [...reloj.children] as HTMLElement[];
  reloj.className = 'gm-circulo gm-reloj';
  tiempo.className = 'num gm-crono';
  sub.className = 'gm-kg-sub';
  const centro = document.createElement('div');
  centro.append(tiempo, sub);
  reloj.replaceChildren(centro);
  reloj.insertAdjacentHTML('afterbegin', RUNA);
}

// Los botones llevan ▶ ⏸ ⏹ 🗑 delante; en Android salen como emoji de color.
export const sinGlifo = (txt: string): string => txt.replace(/^[^\p{L}\p{N}]+/u, '');

