// Entreno de Jose antes de empezar: la rueda de días arriba y, debajo, la
// tarjeta del día elegido con el peso que propone el motor y las reps de la
// última vez. entreno.astro la carga con import dinámico solo en su perfil.

import { CAMPOS, camposDe, maquinaPorDefecto, precargar, ultimoCardio } from './cardio';
import { diasDesdeUltimaVez } from './historial';
import { el, boton } from './dom';
import { iconoDeDia, iconoEl } from './iconos';
import { haceDias, resumenDia, ultimasReps } from './rueda';
import type { DiaDef, EjercicioDef, Rutina, Sesion } from './types';

export interface DatosRueda {
  rutina: Rutina;
  sesiones: Sesion[];
  tocaId: string;
  selId: string;
  hechosHoy: string[];
  descanso: boolean;
  pesoDe: (e: EjercicioDef) => string;
  objetivo: (e: EjercicioDef) => string;
  alElegir: (id: string) => void;
  alEmpezar: (id: string, maquina?: string) => void;
  alDescanso: () => void;
}

const fmt = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 2 });

function casilla(d: DatosRueda, dia: DiaDef): HTMLElement {
  const on = dia.id === d.selId;
  const toca = dia.id === d.tocaId;
  const sub = d.hechosHoy.includes(dia.id) ? 'hoy' : toca ? 'toca' : haceDias(diasDesdeUltimaVez(d.sesiones, dia.id));
  const b = boton(
    `ru-casilla ${on ? 'ru-on' : ''} ${toca ? 'ru-toca' : ''}`,
    null,
    () => d.alElegir(dia.id),
  );
  b.setAttribute('aria-pressed', String(on));
  b.append(
    iconoEl(iconoDeDia(d.rutina.dias, dia), dia.emoji, 26),
    el('span', 'text-[11px] font-bold', dia.nombre),
    el('span', 'num ru-sub text-[10px]', sub),
  );
  return b;
}

function filaEjercicio(d: DatosRueda, e: EjercicioDef, i: number): HTMLElement {
  const peso = d.pesoDe(e);
  const m = peso.match(/^([+\d.,]+)\s*(.*)$/);
  const reps = ultimasReps(d.sesiones, e.ranuraId);
  return el(
    'div',
    'ru-fila',
    el('span', 'num w-5 shrink-0 text-[11px] ru-n', String(i + 1).padStart(2, '0')),
    el(
      'div',
      'flex min-w-0 flex-1 flex-col gap-1',
      el('span', 'text-[15px] leading-tight', e.nombre),
      el('span', 'num text-xs text-mut', `${d.objetivo(e)}${e.restSeg ? ` · ${e.restSeg} s` : ''}`),
    ),
    el(
      'div',
      'flex shrink-0 flex-col items-end gap-1.5',
      m
        ? el('span', 'num text-xl font-bold ru-oro', m[1], el('span', 'text-[11px] text-mut', m[2] ? ` ${m[2]}` : ''))
        : el('span', 'num text-[13px] font-bold text-mut', peso || '—'),
      reps.length ? el('span', 'flex gap-[3px]', ...reps.map((r) => el('span', 'num ru-rep', String(r)))) : null,
    ),
  );
}

function bloqueCardio(d: DatosRueda, dia: DiaDef, elegir: (id: string) => void, maquina: string): HTMLElement {
  const ultima = ultimoCardio(d.sesiones, maquina);
  const ej = dia.ejercicios.find((e) => e.ranuraId === maquina);
  const partes: string[] = [];
  if (ultima?.segundos) partes.push(`${Math.round(ultima.segundos / 60)} min`);
  for (const c of camposDe(ej?.ejercicioId)) {
    if (c === 'pulso') continue;
    const v = ultima?.cardio?.[c];
    if (v != null) partes.push(`${fmt(v)}${CAMPOS[c].unidad ? ` ${CAMPOS[c].unidad}` : ''}`);
  }
  const objetivo = precargar(ultima?.cardio ?? null).objetivoMin;
  return el(
    'div',
    'flex flex-col gap-2.5',
    el('div', 'flex items-baseline gap-2.5', el('span', 'num text-[40px] font-bold ru-oro', String(objetivo)), el('span', 'text-[15px] text-mut', 'min de objetivo')),
    el(
      'div',
      'grid grid-cols-3 gap-2',
      ...dia.ejercicios.map((e) => {
        const b = boton(`ru-maquina ${e.ranuraId === maquina ? 'ru-on' : ''}`, e.nombre.replace('Bicicleta estática', 'Bicicleta'), () => elegir(e.ranuraId));
        b.setAttribute('aria-pressed', String(e.ranuraId === maquina));
        return b;
      }),
    ),
    partes.length ? el('p', 'num mt-1 text-xs text-mut', `última: ${partes.join(' · ')}`) : null,
  );
}

export function pintarRueda(root: HTMLElement, d: DatosRueda): void {
  const dias = [...d.rutina.dias.filter((x) => !x.fueraDeRueda), ...d.rutina.dias.filter((x) => x.fueraDeRueda)];
  const dia = d.rutina.dias.find((x) => x.id === d.selId) ?? dias[0];
  let maquina = dia.fueraDeRueda ? maquinaPorDefecto(d.sesiones, dia.ejercicios.map((e) => e.ranuraId)) : undefined;

  const rueda = el('div', 'grid gap-1.5', ...dias.map((x) => casilla(d, x)));
  rueda.style.gridTemplateColumns = `repeat(${dias.length}, minmax(0, 1fr))`;
  const tocaDia = d.rutina.dias.find((x) => x.id === d.tocaId);

  const ultimaFecha = d.sesiones
    .filter((s) => s.estado === 'finalizada' && s.diaId === dia.id)
    .map((s) => s.fecha)
    .sort()
    .pop() ?? null;
  const resumen = dia.fueraDeRueda ? `${dia.ejercicios.length} máquinas` : resumenDia(dia, ultimaFecha);

  const cuerpo = el('div');
  const pintarCuerpo = () =>
    cuerpo.replaceChildren(
      dia.fueraDeRueda
        ? bloqueCardio(d, dia, (id) => {
            maquina = id;
            pintarCuerpo();
          }, maquina!)
        : el('div', 'flex flex-col', ...dia.ejercicios.map((e, i) => filaEjercicio(d, e, i))),
    );
  pintarCuerpo();

  const empezar = boton('btn', dia.fueraDeRueda ? 'Empezar cardio' : `Empezar ${dia.nombre}`, () => d.alEmpezar(dia.id, maquina));
  const descanso = boton('btn-2 suave py-2.5 text-sm', d.descanso ? 'He cambiado de idea' : 'Hoy descanso', d.alDescanso);

  root.replaceChildren(
    el(
      'section',
      'flex flex-col gap-3',
      el(
        'div',
        'flex items-baseline justify-between px-1',
        el('p', 'eyebrow', 'La rueda'),
        tocaDia ? el('p', 'num text-xs text-mut', `toca: ${tocaDia.nombre}`) : null,
      ),
      rueda,
    ),
    el(
      'section',
      'card mt-4 flex flex-col gap-4',
      el(
        'div',
        'flex items-center gap-4',
        el('span', 'ru-simbolo', iconoEl(iconoDeDia(d.rutina.dias, dia), dia.emoji, 32)),
        el(
          'div',
          'flex min-w-0 flex-col gap-1',
          el('p', 'ru-nombre', dia.nombre),
          el('p', 'text-sm text-mut', resumen),
        ),
      ),
      cuerpo,
      d.descanso ? el('p', 'text-xs font-semibold text-warn', 'Hoy lo tienes como descanso.') : null,
      el('div', 'flex flex-col gap-2', empezar, descanso),
    ),
  );
}
