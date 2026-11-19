// Hoy de Jose: el día del plan arriba y, debajo, la semana, lo que toca, el
// trayecto de peso y cintura, el motor, los récords y el marcador. index.astro
// lo carga con import dinámico solo en su perfil.

import { filasSeries } from './datos';
import { el } from './dom';
import { iconoDeDia, iconoEl } from './iconos';
import { svgLinea } from './iconos-linea';
import { contadores, diaDelPlan, recordsRecientes, semanaActual, serieMedida, subidasMotor, type SerieMedida } from './trayecto';
import type { BackupV2, DiaDef, Ejercicio, Mediciones, Rutina, Sesion } from './types';

export interface DatosTrayecto {
  hoy: string;
  inicioPlan: string;
  objetivoSemana: number;
  metaPeso?: [number, number];
  rutina: Rutina;
  rutinas: Rutina[];
  sesiones: Sesion[];
  mediciones: Mediciones;
  catalogo: Ejercicio[];
  dia: DiaDef;
  estado: 'toca' | 'elegido' | 'hecho' | 'descanso';
}

const fmt = (n: number, dec = 0) =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: 'always' } as Intl.NumberFormatOptions).format(n);
const kg = (n: number) => fmt(n, Number.isInteger(n) ? 0 : n * 10 === Math.round(n * 10) ? 1 : 2);
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fechaCorta = (f: string) => `${Number(f.slice(8))} ${MESES[Number(f.slice(5, 7)) - 1]}`;
const sinParentesis = (s: string) => s.replace(/\s*\([^)]*\)/g, '');

const html = <K extends keyof HTMLElementTagNameMap>(tag: K, clase: string, contenido: string) => {
  const e = el(tag, clase);
  e.innerHTML = contenido;
  return e;
};
const cabecera = (titulo: string, dato?: string) =>
  el('div', 'flex items-baseline justify-between gap-3', el('p', 'eyebrow', titulo), dato ? el('p', 'num text-xs text-mut', dato) : null);

export function pintarCabeceraTrayecto(root: HTMLElement, d: Pick<DatosTrayecto, 'hoy' | 'inicioPlan'>): void {
  const fecha = new Date(`${d.hoy}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  root.replaceChildren(
    el('p', 'eyebrow', fecha),
    el('p', 'ty-dia', 'Día ', el('span', 'ty-dia-n', String(diaDelPlan(d.inicioPlan, d.hoy)))),
  );
}

function tarjetaSemana(d: DatosTrayecto): HTMLElement {
  const s = semanaActual(d.sesiones, d.rutinas, d.hoy, d.objetivoSemana);
  const lunes = s.dias[0].fecha;
  const domingo = s.dias[6].fecha;
  const C = 2 * Math.PI * 40;
  const arco = (Math.min(s.gym, s.objetivo) / s.objetivo) * C;
  const anillo = html(
    'div',
    'relative h-24 w-24 shrink-0',
    `<svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="40" fill="none" stroke="var(--color-line)" stroke-width="6"/>` +
      `<circle cx="48" cy="48" r="40" fill="none" stroke="var(--color-vio-hi)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${arco.toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 48 48)"/></svg>` +
      `<div class="absolute inset-0 flex flex-col items-center justify-center"><span class="num text-2xl font-bold leading-none">${s.gym}<span class="text-base text-mut">/${s.objetivo}</span></span><span class="mt-1 text-[11px] text-mut">gym</span></div>`,
  );
  const faltan = s.objetivo - s.gym;
  const titular = faltan > 0 ? `Te ${faltan === 1 ? 'falta 1 entreno' : `faltan ${faltan} entrenos`}` : 'Semana cumplida';
  const cardio = s.cardioSesiones
    ? `Cardio: ${s.cardioSesiones} ${s.cardioSesiones === 1 ? 'sesión' : 'sesiones'}, ${s.cardioMin} min.`
    : 'Sin cardio todavía.';
  const dias = s.dias.map((c) => {
    const ruta = c.diaId ? d.rutinas.find((r) => r.dias.some((x) => x.id === c.diaId)) : undefined;
    const diaGym = ruta?.dias.find((x) => x.id === c.diaId);
    let casilla: HTMLElement;
    if (diaGym) casilla = el('span', 'ty-casilla ty-hecha', iconoEl(iconoDeDia(ruta!.dias, diaGym), diaGym.emoji, 18));
    else if (c.cardio) casilla = el('span', 'ty-casilla ty-hecha', iconoEl('dia-cardio', '🏃', 18));
    else if (c.hoy && d.estado !== 'descanso') casilla = el('span', 'ty-casilla ty-hoy', iconoEl(iconoDeDia(d.rutina.dias, d.dia), d.dia.emoji, 18));
    else casilla = el('span', `ty-casilla ${c.futuro ? 'ty-futura' : ''}`);
    return el('div', 'flex flex-col items-center gap-1.5', el('span', `text-[11px] font-bold ${c.hoy ? 'text-vio-hi' : 'text-mut'}`, c.letra), casilla);
  });
  return el(
    'section',
    'card mt-4 flex flex-col gap-4',
    cabecera('Esta semana', `${Number(lunes.slice(8))} – ${fechaCorta(domingo)}`),
    el(
      'div',
      'flex items-center gap-5',
      anillo,
      el('div', 'flex min-w-0 flex-col gap-2', el('p', 'text-[17px] font-semibold leading-snug', titular), el('p', 'text-sm text-mut', cardio)),
    ),
    el('div', 'grid grid-cols-7 gap-1.5', ...dias),
  );
}

function tarjetaHoyToca(d: DatosTrayecto): HTMLElement {
  const etiqueta = { toca: 'Hoy toca', elegido: 'Hoy haces', hecho: 'Hoy has hecho', descanso: 'Hoy' }[d.estado];
  const nombre = d.estado === 'descanso' ? 'Descansas' : d.dia.nombre;
  const icono = d.estado === 'descanso' ? iconoEl('descanso', '😴', 28) : iconoEl(iconoDeDia(d.rutina.dias, d.dia), d.dia.emoji, 28);
  const a = el(
    'a',
    'ty-toca mt-4',
    el('span', 'ty-toca-ico', icono),
    el('span', 'flex flex-1 flex-col gap-0.5', el('span', 'eyebrow ty-oro', etiqueta), el('span', 'text-lg font-bold', nombre)),
    html('span', 'ty-oro text-2xl', '›'),
  );
  a.href = '/entreno';
  return a;
}

// Peso y cintura en la misma gráfica, cada una con su escala: lo que importa es
// que una sube y la otra baja.
function grafica(peso: SerieMedida | null, cintura: SerieMedida | null, desde: string, hasta: string, meta?: [number, number]): string {
  const W = 318;
  const H = 120;
  const t0 = Date.parse(`${desde}T12:00:00`);
  const span = Math.max(1, Date.parse(`${hasta}T12:00:00`) - t0);
  const x = (f: string) => ((Date.parse(`${f}T12:00:00`) - t0) / span) * W;
  const escala = (vals: number[], extra: number[] = []) => {
    const lo = Math.min(...vals, ...extra) - 1;
    const hi = Math.max(...vals, ...extra) + 1;
    return (v: number) => H - ((v - lo) / (hi - lo)) * H;
  };
  const linea = (s: SerieMedida, y: (v: number) => number) => s.puntos.map((p) => `${x(p.fecha).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ');
  let svg = '';
  if (peso) {
    const y = escala(peso.puntos.map((p) => p.valor), meta ?? []);
    if (meta) {
      svg += `<rect x="0" y="${y(meta[1]).toFixed(1)}" width="${W}" height="${(y(meta[0]) - y(meta[1])).toFixed(1)}" fill="rgb(212 172 90 / .1)"/>`;
      svg += `<text x="${W - 2}" y="${(y(meta[1]) - 4).toFixed(1)}" text-anchor="end" class="ty-eje">meta ${fmt(meta[0])}–${fmt(meta[1])}</text>`;
    }
    svg += `<line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="var(--color-line)"/>`;
    if (cintura) {
      const yc = escala(cintura.puntos.map((p) => p.valor));
      svg += `<polyline points="${linea(cintura, yc)}" fill="none" stroke="var(--color-ok)" stroke-width="1.4" stroke-dasharray="3 3" stroke-linejoin="round"/>`;
    }
    svg += `<polyline points="${linea(peso, y)}" fill="none" stroke="var(--color-vio-hi)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const ult = peso.puntos[peso.puntos.length - 1];
    svg += `<circle cx="${x(ult.fecha).toFixed(1)}" cy="${y(ult.valor).toFixed(1)}" r="3.5" fill="var(--color-vio-hi)"/>`;
  }
  const ini = new Date(t0);
  for (let m = new Date(ini.getFullYear(), ini.getMonth() + 1, 1); m.getTime() <= t0 + span; m.setMonth(m.getMonth() + 1)) {
    const f = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-01`;
    svg += `<text x="${x(f).toFixed(1)}" y="${H + 18}" class="ty-eje">${MESES[m.getMonth()]}</text>`;
  }
  return `<svg class="ty-grafica" viewBox="0 -8 ${W} ${H + 30}" role="img" aria-label="Peso y cintura desde el inicio del plan">${svg}</svg>`;
}

function tarjetaTrayecto(d: DatosTrayecto): HTMLElement | null {
  const peso = serieMedida(d.mediciones.peso.map((p) => ({ fecha: p.fecha, valor: p.kg })));
  const cintura = serieMedida(d.mediciones.cintura.map((c) => ({ fecha: c.fecha, valor: c.cm })));
  if (!peso && !cintura) return null;
  const signo = (n: number) => (n > 0 ? `+${kg(n)}` : n < 0 ? `−${kg(-n)}` : '=');
  const dato = (titulo: string, s: SerieMedida, unidad: string, tono: string, coletilla: string) =>
    el(
      'div',
      '',
      el('p', 'text-[13px] text-mut', titulo),
      html('p', 'num mt-1 text-[28px] font-bold leading-none', `${kg(s.actual)}<span class="text-sm text-mut"> ${unidad}</span>`),
      el('p', `num mt-1.5 text-[13px] ${tono}`, `${signo(s.delta)} ${unidad}${coletilla}`),
    );
  const desdeMes = (s: SerieMedida) => ` desde ${MESES[Number(s.desde.slice(5, 7)) - 1]}`;
  return el(
    'section',
    'card mt-4 flex flex-col gap-3.5',
    cabecera('Trayecto', `desde el ${fechaCorta(d.inicioPlan)}`),
    el(
      'div',
      'grid grid-cols-2 gap-3',
      peso ? dato('Peso', peso, 'kg', 'text-vio-hi', '') : null,
      cintura ? dato('Cintura', cintura, 'cm', 'text-ok', desdeMes(cintura)) : null,
    ),
    html('div', '', grafica(peso, cintura, d.inicioPlan, d.hoy, d.metaPeso)),
    html(
      'div',
      'flex gap-4 text-xs text-mut',
      '<span class="flex items-center gap-1.5"><span class="ty-ley-peso"></span>Peso</span><span class="flex items-center gap-1.5"><span class="ty-ley-cintura"></span>Cintura</span>',
    ),
  );
}

function tarjetaMotor(d: DatosTrayecto): HTMLElement | null {
  const subidas = subidasMotor(d.sesiones, 4);
  if (!subidas.length) return null;
  const a = el('a', 'text-sm font-semibold ty-oro', 'Todas en Progreso ›');
  a.href = '/progreso';
  return el(
    'section',
    'card mt-4 flex flex-col gap-3.5',
    cabecera('El motor ha subido', 'desde el inicio'),
    ...subidas.map((s) => {
      const barra = el('div', 'ty-barra');
      barra.style.setProperty('--ty-desde', `${Math.round((s.desde / s.hasta) * 100)}%`);
      return el(
        'div',
        'flex flex-col gap-1.5',
        el('div', 'flex justify-between gap-3 text-[15px]', el('span', 'min-w-0 truncate', sinParentesis(s.nombre)), el('span', 'num shrink-0 ty-oro', `+${kg(s.hasta - s.desde)} kg`)),
        barra,
        el('p', 'num text-xs text-mut', `${kg(s.desde)} → ${kg(s.hasta)} kg`),
      );
    }),
    a,
  );
}

function tarjetaRecords(d: DatosTrayecto): HTMLElement | null {
  const rs = recordsRecientes(d.sesiones, 3);
  if (!rs.length) return null;
  return el(
    'section',
    'card mt-4 flex flex-col gap-3',
    cabecera('Récords recientes'),
    ...rs.map((r) =>
      el(
        'div',
        'flex items-center gap-3',
        html('span', 'ty-oro flex', svgLinea('record', 20)),
        el('span', 'min-w-0 flex-1 truncate text-[15px]', sinParentesis(r.nombre)),
        el('span', 'num text-sm', `${kg(r.kg)} kg`),
        el('span', 'num w-12 text-right text-xs text-mut', fechaCorta(r.fecha)),
      ),
    ),
  );
}

function tarjetaMarcador(d: DatosTrayecto): HTMLElement {
  const b = { version: 2, catalogo: d.catalogo, rutinas: d.rutinas, sesiones: d.sesiones, mediciones: d.mediciones } as BackupV2;
  const c = contadores(d.sesiones, filasSeries(b));
  const casilla = (valor: string, unidad: string, texto: string) =>
    el(
      'div',
      '',
      html('p', 'num text-[22px] font-bold', `${valor}${unidad ? `<span class="text-sm text-mut"> ${unidad}</span>` : ''}`),
      el('p', 'mt-1 text-xs text-mut', texto),
    );
  return el(
    'section',
    'card mt-4 grid grid-cols-3 gap-x-2 gap-y-5 text-center',
    casilla(fmt(c.dias), '', 'días'),
    casilla(fmt(c.series), '', 'series'),
    casilla(fmt(c.reps), '', 'reps'),
    casilla(fmt(c.toneladas, c.toneladas < 10 ? 1 : 0), 't', 'levantadas'),
    casilla(fmt(c.horas), 'h', 'entrenando'),
    casilla(fmt(c.km, c.km < 10 ? 1 : 0), 'km', 'en cinta'),
  );
}

export function pintarTrayecto(root: HTMLElement, d: DatosTrayecto): void {
  root.replaceChildren(
    ...[tarjetaSemana(d), tarjetaHoyToca(d), tarjetaTrayecto(d), tarjetaMotor(d), tarjetaRecords(d), tarjetaMarcador(d)].filter(
      (x): x is HTMLElement => x != null,
    ),
  );
}
