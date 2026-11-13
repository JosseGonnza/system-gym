import { anual, type CeldaAnual } from './anual';
import { el } from './dom';
import type { Sesion } from './types';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const TONO = ['bg-surface2', 'bg-vio/30', 'bg-vio/55', 'bg-vio/80', 'bg-vio'];
const CELDA = 11;
const HUECO = 3;

const fecha = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

export function tarjetaAnual(root: HTMLElement, sesiones: Sesion[], hoy: string, objetivo: number): void {
  const a = anual(sesiones, hoy, objetivo);
  const pie = el('p', 'mt-2 h-4 text-xs font-semibold text-mut', 'El tono va por minutos. Toca un cuadrito para ver el día.');
  const cuadro = (c: CeldaAnual) => {
    const b = el('button', `block rounded-[3px] ${TONO[c.nivel]} ${c.futuro ? 'invisible' : ''} ${c.fecha === hoy ? 'ring-1 ring-ink' : ''}`);
    b.type = 'button';
    b.style.width = b.style.height = `${CELDA}px`;
    b.addEventListener('click', () => {
      pie.textContent = `${fecha(c.fecha)} · ${c.nivel ? `${c.min} min` : 'sin entreno'}`;
    });
    return b;
  };

  const meses = el('div', 'relative h-4 text-[10px] font-bold text-mut');
  for (const m of a.meses) {
    const s = el('span', 'absolute top-0', MESES[m.mes]);
    s.style.left = `${m.col * (CELDA + HUECO)}px`;
    meses.append(s);
  }
  const rejilla = el('div', 'grid grid-flow-col', ...a.semanas.flat().map(cuadro));
  rejilla.style.gridTemplateRows = `repeat(7, ${CELDA}px)`;
  rejilla.style.gap = `${HUECO}px`;

  const etiquetas = el('div', 'grid shrink-0 pr-1.5 pt-4 text-[9px] font-bold leading-none text-mut', ...['L', '', 'X', '', 'V', '', ''].map((d) => el('span', 'flex items-center', d)));
  etiquetas.style.gridTemplateRows = `repeat(7, ${CELDA}px)`;
  etiquetas.style.gap = `${HUECO}px`;
  const scroll = el('div', 'overflow-x-auto', el('div', 'w-max', meses, rejilla));

  const leyenda = el(
    'div',
    'mt-1 flex items-center justify-end gap-1 text-[10px] font-bold text-mut',
    'Menos',
    ...TONO.map((t) => {
      const s = el('span', `inline-block rounded-[3px] ${t}`);
      s.style.width = s.style.height = `${CELDA}px`;
      return s;
    }),
    'Más',
  );

  const dato = (n: number, txt: string) => el('div', '', el('p', 'num text-lg font-extrabold', `${n}`), el('p', 'text-xs text-mut', txt));
  root.replaceChildren(
    el('h2', 'text-base font-bold', 'Último año'),
    el('div', 'mt-2 grid grid-cols-2 gap-4', dato(a.entrenos, 'días entrenados'), dato(a.racha, `${a.racha === 1 ? 'semana seguida' : 'semanas seguidas'} con ${objetivo} o más`)),
    el('div', 'mt-3 flex', etiquetas, scroll),
    leyenda,
    pie,
  );
  root.classList.remove('hidden');
  scroll.scrollLeft = scroll.scrollWidth;
}
