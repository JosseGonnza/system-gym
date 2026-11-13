import { el } from './dom';
import type { Rutina, Sesion } from './types';
import { FRANJA, volumen } from './volumen';

const n = (x: number) => x.toLocaleString('es-ES', { maximumFractionDigits: 1 });

export function tarjetaVolumen(root: HTMLElement, sesiones: Sesion[], rutinas: Rutina[], hoy: string): void {
  const filas = volumen(sesiones, rutinas, hoy);
  const tope = Math.max(FRANJA[1] + 5, ...filas.map((f) => Math.max(f.esta, f.media)));
  const pct = (x: number) => `${(x / tope) * 100}%`;
  const [min, max] = FRANJA;

  const fila = (f: (typeof filas)[number]) => {
    const conFranja = f.musculo !== 'core';
    const pista = el('div', 'relative h-2.5 overflow-hidden rounded-full bg-surface2');
    if (conFranja) {
      const banda = el('div', 'absolute inset-y-0 bg-ok/20');
      banda.style.left = pct(min);
      banda.style.width = pct(max - min);
      pista.append(banda);
    }
    const barra = el('div', 'absolute inset-y-0 left-0 rounded-full bg-vio');
    barra.style.width = pct(f.esta);
    const marca = el('div', 'absolute inset-y-0 w-0.5 bg-ink');
    marca.style.left = pct(f.media);
    pista.append(barra, marca);
    const fuera = conFranja && (f.media < min || f.media > max);
    return el(
      'div',
      'grid grid-cols-[5.5rem_1fr_4.5rem] items-center gap-2 py-1',
      el('span', 'text-sm font-semibold', f.nombre),
      pista,
      el('span', 'num text-right text-xs', el('b', 'text-ink', n(f.esta)), el('span', fuera ? 'text-warn' : 'text-mut', ` · ${n(f.media)}`)),
    );
  };

  root.replaceChildren(
    el('h2', 'text-base font-bold', 'Volumen por músculo'),
    el('p', 'mt-1 text-xs text-mut', `Series hechas esta semana · media de las 4 anteriores (la raya). La zona sombreada es la franja de ${min} a ${max} por semana.`),
    el('div', 'mt-3', ...filas.map(fila)),
    el('p', 'mt-2 text-xs text-mut', 'El músculo principal suma la serie entera y los que ayudan, media. Si la media sale en color, está fuera de la franja.'),
  );
  root.classList.remove('hidden');
}
