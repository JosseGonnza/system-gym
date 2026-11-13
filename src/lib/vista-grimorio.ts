// Entreno de Yasmina cuando no hay sesión: el Grimorio, su rutina como un libro.
// Un marcapáginas por día (I, II, III y la hoja del día suave) y, en cada
// página, sus ejercicios con el peso de ahora, cuánto cambió y la línea de las
// últimas sesiones. entreno.astro lo carga con import dinámico.

import { capitulos, etiquetaMarcador, nombreBonito, romano, tendenciaRanura, ultimaVez } from './grimorio';
import { svgTrazo } from './iconos-trazo';
import { el } from './dom';
import type { DiaDef, EjercicioDef, Rutina, Sesion } from './types';

export interface DatosGrimorio {
  hoy: string;
  rutina: Rutina;
  sesiones: Sesion[];
  pagina: string;
  tocaId: string;
  objetivo: (e: EjercicioDef) => string;
  // "kg" o "kg/lado", como en Hoy: el peso guardado es el de la entrada
  unidad: (e: EjercicioDef) => string;
  alCambiarPagina: (diaId: string) => void;
  alEmpezar: (diaId: string) => void;
}

const PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg>';
const ESQ = '<svg class="gm-esq" viewBox="0 0 14 14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1" d="M1 13V5a4 4 0 0 1 4-4h8M4 9.5c0-3 2.5-5.5 5.5-5.5"/><circle cx="4" cy="4" r="1" fill="currentColor"/></svg>';

const num = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 2 });

// La línea de las últimas sesiones: oro, con el último punto en cobre.
function linea(v: number[]): string {
  const w = 54;
  const h = 22;
  const p = 3;
  if (v.length < 2) return `<svg class="gm-spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"></svg>`;
  const min = Math.min(...v);
  const r = Math.max(...v) - min || 1;
  const pts = v.map((y, i) => [p + (i * (w - 2 * p)) / (v.length - 1), h - p - ((y - min) / r) * (h - 2 * p)]);
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  return `<svg class="gm-spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d} L${lx} ${h} L${pts[0][0]} ${h}Z" fill="rgb(207 174 102 / .12)"/><path d="${d}" fill="none" stroke="#cfae66" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${lx}" cy="${ly}" r="2.6" fill="#ee9a5f"/></svg>`;
}

function filaEjercicio(e: EjercicioDef, d: DatosGrimorio): HTMLElement {
  const porTiempo = e.tipoProgresion === 'tiempo';
  const v = tendenciaRanura(d.sesiones, e.ranuraId, porTiempo);
  const unidad = porTiempo ? 's' : d.unidad(e);
  const actual = v.length ? `${num(v[v.length - 1])} ${unidad}` : '—';
  const dif = v.length > 1 ? v[v.length - 1] - v[v.length - 2] : null;
  const cambio =
    dif == null
      ? el('small', 'gm-igual', v.length ? 'la primera' : 'sin marcas')
      : dif > 0
        ? el('small', 'gm-sube', `▲ ${num(dif)}`)
        : dif < 0
          ? el('small', 'gm-igual', `▼ ${num(-dif)}`)
          : el('small', 'gm-igual', 'igual');

  const fila = el(
    'div',
    'gm-ej',
    el('div', 'gm-ej-nom', e.nombre, el('small', '', d.objetivo(e))),
    el('div', 'gm-ej-peso', actual, cambio),
  );
  fila.insertAdjacentHTML('beforeend', linea(v));
  return fila;
}

function textoUltimaVez(sesiones: Sesion[], dia: DiaDef): string {
  const u = ultimaVez(sesiones, dia.id);
  if (!u) return 'Aún no has abierto esta página.';
  const f = new Date(`${u.fecha}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
  const como = u.valorados ? ` · te fue fácil en ${u.faciles} de ${u.valorados}` : '';
  return `Última vez el ${f}${como}`;
}

export function pintarGrimorio(cont: HTMLElement, d: DatosGrimorio): void {
  const rueda = d.rutina.dias.filter((x) => !x.fueraDeRueda);
  const sub = el(
    'p',
    'gm-sub',
    `Rueda de ${rueda.length} · `,
    el('em', '', `llevas ${capitulos(d.sesiones)} ${capitulos(d.sesiones) === 1 ? 'capítulo' : 'capítulos'}`),
  );

  const marcadores = el(
    'div',
    'gm-marcadores',
    ...d.rutina.dias.map((dia) => {
      const on = dia.id === d.pagina;
      const b = el('button', `gm-marcador${on ? ' gm-on' : ''}`);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(on));
      if (dia.fueraDeRueda) b.innerHTML = svgTrazo('dia-cardio', 16);
      else b.append(romano(rueda.indexOf(dia) + 1));
      b.append(el('small', '', etiquetaMarcador(dia)));
      if (dia.id === d.tocaId) b.classList.add('gm-toca');
      b.setAttribute('aria-label', `${dia.nombre}${dia.id === d.tocaId ? ', toca hoy' : ''}${on ? ', abierta' : ''}`);
      b.addEventListener('click', () => d.alCambiarPagina(dia.id));
      return b;
    }),
  );

  const dia = d.rutina.dias.find((x) => x.id === d.pagina) ?? d.rutina.dias[0];
  const pagina = el('section', 'card glow gm-pagina');
  pagina.insertAdjacentHTML('beforeend', ESQ.replace('gm-esq', 'gm-esq gm-esq-bl') + ESQ.replace('gm-esq', 'gm-esq gm-esq-br'));
  pagina.append(
    el(
      'div',
      'gm-pag-titulo',
      el('span', 'eyebrow', dia.fueraDeRueda ? 'El día suave' : `Página ${romano(rueda.indexOf(dia) + 1)}`),
      el('h2', 'gm-h gm-h-pag', nombreBonito(dia.nombre)),
      el('p', '', textoUltimaVez(d.sesiones, dia)),
    ),
    el('div', 'gm-ejs', ...dia.ejercicios.map((e) => filaEjercicio(e, d))),
  );
  const empezar = el('button', 'btn gm-empezar');
  empezar.type = 'button';
  empezar.innerHTML = `${PLAY}Empezar esta página`;
  empezar.addEventListener('click', () => d.alEmpezar(dia.id));
  pagina.append(empezar);

  cont.replaceChildren(sub, marcadores, pagina);
}
