import { CARTA, type Persona } from './casa';
import type { DiaComidas } from './comidas';
import { el } from './dom';
import { AJUSTE_KCAL, semanasPD, veredicto, type Veredicto } from './peso-dieta';
import type { Mediciones } from './types';

const n1 = (x: number) => x.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const conSigno = (x: number) => `${x > 0 ? '+' : ''}${n1(x)}`;
const kgSem = (x: number) => `${x > 0 ? '+' : ''}${x.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`;
const pct = (x: number) => `${Math.round(x * 100)} %`;
const corta = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

function texto(v: Veredicto, hoy: string): string {
  const r = v.ritmo != null ? `${conSigno(v.ritmo)} kg/sem` : '';
  switch (v.tipo) {
    case 'pronto':
      if (hoy < CARTA.inicio) return `La dieta empieza el lunes ${corta(CARTA.inicio)}. Marca lo que comes y pésate 2–3 mañanas por semana.`;
      if (v.faltan) return `Con dos semanas de dieta te digo si va bien: faltan ${v.faltan} ${v.faltan === 1 ? 'día' : 'días'}. Mientras, marca lo que comes y pésate 2–3 mañanas por semana.`;
      return 'Pésate 2–3 mañanas por semana para ver hacia dónde va el peso.';
    case 'cumplir':
      return `En las dos últimas semanas has marcado el ${pct(v.cumple ?? 0)} de las comidas. Antes de tocar las kcal, toca cumplir el plan (o marcar lo que sí comes).`;
    case 'rapido':
      return `Bajas a ${r}, más rápido de lo previsto. Sube unas ${AJUSTE_KCAL} kcal para no perder músculo.`;
    case 'lento':
      return `Cumples la dieta y el peso va a ${r}, más lento de lo previsto. Toca quitar unas ${AJUSTE_KCAL} kcal.`;
    case 'cintura':
      return `El peso va a ${r}, pero la cintura baja: vas bien, sigue igual.`;
    case 'ritmo':
      return `Vas a ritmo (${r}). Sigue igual.`;
  }
}

const TONO: Record<Veredicto['tipo'], string> = {
  pronto: 'border-line',
  cumplir: 'border-warn',
  rapido: 'border-warn',
  lento: 'border-warn',
  cintura: 'border-ok',
  ritmo: 'border-ok',
};

export function tarjetaPesoDieta(root: HTMLElement, p: Persona, med: Mediciones, comidas: Record<string, DiaComidas>, hoy: string): void {
  const v = veredicto(p, med, comidas, hoy);
  const sem = semanasPD(p, med, comidas, hoy);
  const [rapido, lento] = CARTA.personas[p].ritmo;

  const caja = el(
    'div',
    `mt-3 rounded-xl border-l-4 ${TONO[v.tipo]} bg-surface2 px-3 py-2.5`,
    el('p', 'text-sm font-semibold', texto(v, hoy)),
    el(
      'p',
      'num mt-1 text-xs text-mut',
      `Objetivo: ${kgSem(rapido)} a ${kgSem(lento)} kg/sem (${CARTA.personas[p].nota}).`,
      v.tipo === 'rapido' || v.tipo === 'lento' ? ' El ajuste se hace en la carta.' : '',
    ),
  );

  const celda = (arriba: string, abajo = '') => el('div', 'text-right', el('p', 'num text-sm font-bold', arriba), abajo ? el('p', 'num text-[10px] text-mut', abajo) : null);
  const conDatos = sem.filter((s, i) => i === 0 || s.peso != null || s.cintura != null || s.cumple != null);
  const filas = conDatos.map((s, i) => {
    const prev = sem[sem.indexOf(s) + 1]?.peso;
    return el(
      'div',
      'grid grid-cols-[1fr_1fr_1fr_1fr] items-center gap-2 border-t border-line/50 py-1.5',
      el('p', 'text-xs font-semibold text-mut', i === 0 ? 'Esta' : corta(s.lunes)),
      celda(s.peso != null ? n1(s.peso) : '—', s.peso != null && prev != null ? conSigno(s.peso - prev) : ''),
      celda(s.cintura != null ? n1(s.cintura) : '—'),
      celda(s.cumple != null ? pct(s.cumple) : '—', s.kcal != null ? `${Math.round(s.kcal).toLocaleString('es-ES')} kcal` : ''),
    );
  });

  root.replaceChildren(
    el('h2', 'text-base font-bold', 'Dieta y peso'),
    caja,
    el(
      'div',
      'mt-3 grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 text-[10px] font-bold uppercase tracking-wide text-mut',
      el('span', '', 'Semana'),
      el('span', 'text-right', 'Peso kg'),
      el('span', 'text-right', 'Cintura'),
      el('span', 'text-right', 'Dieta'),
    ),
    ...filas,
    el('p', 'mt-2 text-xs text-mut', 'Dieta: comidas marcadas y kcal por día de lo marcado más lo de fuera de lista.'),
  );
  root.classList.remove('hidden');
}
