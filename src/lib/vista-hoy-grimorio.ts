// Hoy del Grimorio (perfil de Yasmina): qué toca (y a un toque, su página del
// Grimorio), cómo va la semana, lo que la anima a seguir, qué ha comido y el mes. Sustituye a la tarjeta del modo sencillo solo
// en su perfil; index.astro carga este módulo con import dinámico.

import { CARTA, COMIDAS, diaCiclo, racion } from './casa';
import type { DiaComidas } from './comidas';
import { ESTRELLA, GATO, bolaCristal } from './dibujos-grimorio';
import { estrellasMes, faseLunar, fraseMes, lunasSemana, nombreBonito, proximoHito, racha, type Luna } from './grimorio';
import { iconoDeDia } from './iconos';
import { svgTrazo } from './iconos-trazo';
import { el } from './dom';
import { subidasMotor } from './trayecto';
import type { DiaDef, EjercicioDef, Rutina, Sesion } from './types';

export interface DatosHoyGrimorio {
  hoy: string;
  rutina: Rutina;
  rutinas: Rutina[];
  dia: DiaDef;
  hecho: boolean;
  sugerido: boolean;
  pesoDe: (e: EjercicioDef) => string;
  // Peso que propone el motor hoy, en número, para el próximo hito.
  pesoHoy: (e: EjercicioDef) => number | null;
  porLado: (e: EjercicioDef) => boolean;
  sesiones: Sesion[];
  objetivoSemana: number;
  entrenosMes: number;
  comidas?: DiaComidas | null;
}

const html = (tag: keyof HTMLElementTagNameMap, clase: string, contenido: string) => {
  const e = el(tag, clase);
  e.innerHTML = contenido;
  return e;
};

const duracion = (d: DiaDef) =>
  d.fueraDeRueda
    ? 'cardio a tu ritmo, 20-40 min'
    : `${d.ejercicios.length} ejercicios · unos ${Math.round((d.ejercicios.reduce((n, e) => n + e.series, 0) * 2.3 + 5) / 5) * 5} min`;

const fila = (izq: string, der: string) => el('div', 'gm-fila', el('span', 'eyebrow', izq), el('span', 'gm-meta', der));

function luna(l: Luna): string {
  if (l.tipo === 'llena')
    return `<svg class="gm-luna gm-llena${l.hoy ? ' gm-hoy-llena' : ''}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="${l.hoy ? '#ee9a5f' : '#cfae66'}"/></svg>`;
  if (l.tipo === 'suave')
    return '<svg class="gm-luna" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="rgb(207 174 102 / .45)" stroke-width="1.2"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="#ee9a5f"/></svg>';
  if (l.hoy)
    return '<svg class="gm-luna gm-late" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="#ee9a5f" stroke-width="1.3" stroke-dasharray="2 2.4"/></svg>';
  return '<svg class="gm-luna" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="rgb(207 174 102 / .25)" stroke-width="1.2"/></svg>';
}

const CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const VELA = '<svg viewBox="0 0 14 26" width="14" height="26" aria-hidden="true"><path class="gm-llama" d="M7 1c2 3 3 4.5 3 6.5a3 3 0 0 1-6 0C4 5.5 5 4 7 1z"/><rect x="3" y="11" width="8" height="15" rx="1.5" fill="#efe4c8"/></svg>';
const VELA_APAGADA = '<svg viewBox="0 0 14 26" width="14" height="26" aria-hidden="true"><rect x="3" y="11" width="8" height="15" rx="1.5" fill="none" stroke="rgb(239 228 200 / .4)" stroke-dasharray="2 2"/></svg>';
const ORDINAL = ['primera', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta', 'séptima', 'octava', 'novena', 'décima'];

// Una vela por semana seguida llegando a su objetivo; la de esta semana espera
// apagada hasta que llegue.
function velas(n: number, estaArde: boolean, objetivo: number): HTMLElement {
  const fila = html('span', 'gm-velas-fila', VELA.repeat(Math.min(n, 6)) + (estaArde ? '' : VELA_APAGADA));
  const texto =
    n === 0
      ? `Llega a ${objetivo} esta semana y enciendes la primera vela.`
      : `${n === 1 ? '1 vela encendida' : `${n} velas encendidas`}: ${n === 1 ? 'una semana cumpliendo' : `${n} semanas seguidas cumpliendo`}. ${
          estaArde ? 'La de esta semana ya arde.' : `Enciende la ${ORDINAL[n] ?? 'siguiente'}.`
        }`;
  return el('div', 'gm-velas', fila, el('p', '', texto));
}

const kg = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 2 });
const minus = (s: string) => s[0].toLowerCase() + s.slice(1);
const sinParentesis = (s: string) => s.replace(/\s*\([^)]*\)/g, '');

function tarjetaHito(d: DatosHoyGrimorio): HTMLElement | null {
  const h = proximoHito(d.sesiones, d.dia, d.pesoHoy);
  if (!h) return null;
  const e = d.dia.ejercicios.find((x) => x.nombre === h.nombre);
  const unidad = e && d.porLado(e) ? 'kg por lado' : 'kg';
  const nombre = minus(sinParentesis(h.nombre));
  const [titular, sub] =
    h.tipo === 'record'
      ? [`Hoy toca récord en ${nombre}`, `${kg(h.kg)} ${unidad}: nunca has movido tanto.`]
      : h.tipo === 'igual'
        ? [`Hoy igualas tu récord en ${nombre}`, `${kg(h.kg)} ${unidad}, tu mejor marca.`]
        : [`A ${kg(h.falta)} kg de tu récord en ${nombre}`, `Hoy toca. Tu mejor marca: ${kg(h.kg)} ${unidad}.`];
  const carta = el('section', 'gm-hito', el('p', 'gm-hito-eyebrow', 'Próximo hito'), el('p', 'gm-hito-h', titular), el('p', 'gm-hito-sub', sub));
  carta.insertAdjacentHTML('afterbegin', svgTrazo('record', 18));
  return carta;
}

function tarjetaFortalecidos(sesiones: Sesion[]): HTMLElement | null {
  const subidas = subidasMotor(sesiones, 3);
  if (!subidas.length) return null;
  return el(
    'section',
    'card',
    fila('Hechizos que se han fortalecido', ''),
    el(
      'div',
      'gm-fuertes',
      ...subidas.map((x) => {
        const f = html('div', 'gm-fuerte', svgTrazo('nota', 18));
        f.append(el('span', 'gm-fuerte-n', sinParentesis(x.nombre)), el('span', 'gm-fuerte-de', `${kg(x.desde)} →`), el('b', '', `${kg(x.hasta)} kg`));
        return f;
      }),
    ),
    el('p', 'gm-frase', 'Cada página del grimorio pesa un poco más.'),
  );
}

export function pintarHoyGrimorio(cont: HTMLElement, d: DatosHoyGrimorio): void {
  const fecha = new Date(`${d.hoy}T12:00:00`);
  const [diaSemana, resto] = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).split(', ');
  const sub = el('p', 'gm-sub', el('em', '', `${diaSemana},`), ` ${resto} · `);
  sub.insertAdjacentHTML('beforeend', svgTrazo('nav-hoy', 14));
  sub.append(` ${faseLunar(fecha)}`);

  // ── El hechizo de hoy ──
  const cab = el('div', 'gm-cab');
  cab.insertAdjacentHTML('beforeend', bolaCristal(iconoDeDia(d.rutina.dias, d.dia)));
  cab.append(
    el(
      'div',
      'gm-titulo',
      el('span', 'eyebrow', d.hecho ? 'Hoy has hecho' : d.sugerido ? 'El hechizo de hoy' : 'Hoy haces'),
      el('h2', 'gm-h', nombreBonito(d.dia.nombre)),
      el('span', 'gm-meta', d.hecho ? '¡Hecho! Te lo has ganado' : duracion(d.dia)),
    ),
  );

  // La tarjeta lleva a su página del Grimorio: ahí ve los pesos y empieza.
  const hero = el('a', 'card glow gm-hero gm-hero-enlace');
  hero.href = `/entreno#pagina-${d.dia.id}`;
  hero.setAttribute('aria-label', `${nombreBonito(d.dia.nombre)}: abrir su página del Grimorio`);
  hero.insertAdjacentHTML('beforeend', GATO);
  cab.append(el('span', 'gm-flecha', '›'));
  hero.append(cab);

  // ── Las lunas de la semana ──
  const { lunas, entrenos } = lunasSemana(d.sesiones, d.rutinas, d.hoy);
  const semana = el(
    'section',
    'card',
    fila('Las lunas de la semana', `${entrenos} de ${d.objetivoSemana}`),
    el('div', 'gm-semana', ...lunas.map((l) => {
      const celda = html('div', `gm-d${l.hoy ? ' gm-d-hoy' : ''}`, luna(l));
      celda.append(l.letra);
      return celda;
    })),
    velas(racha(d.sesiones, d.rutinas, d.objetivoSemana, d.hoy).actual, entrenos >= d.objetivoSemana, d.objetivoSemana),
  );

  const tarjetas: HTMLElement[] = [hero, semana];
  const hito = d.hecho ? null : tarjetaHito(d);
  if (hito) tarjetas.push(hito);
  const fuertes = tarjetaFortalecidos(d.sesiones);
  if (fuertes) tarjetas.push(fuertes);

  // ── Lo que llevas comido (solo con la dieta de casa) ──
  if (d.comidas !== undefined) {
    const idx = diaCiclo(d.hoy);
    const hecho = d.comidas?.hecho ?? {};
    const extras = d.comidas?.snack ?? [];
    const prot =
      COMIDAS.filter((c) => hecho[c]).reduce((n, c) => n + racion('yasmina', idx, c).prot, 0) +
      extras.reduce((n, x) => n + (x.p ?? 0), 0);
    const obj = CARTA.personas.yasmina.prot;
    const barra = el('div', 'gm-barra', el('b'));
    (barra.firstElementChild as HTMLElement).style.width = `${Math.min(100, Math.round((prot / obj) * 100))}%`;
    const comido = el(
      'a',
      'card gm-comido',
      fila('Lo que llevas comido', `${Math.round(prot)} / ${obj} g prot.`),
      el('div', 'gm-comidas', ...COMIDAS.map((c) => {
        const ok = !!hecho[c];
        const celda = html('div', `gm-comida${ok ? ' gm-ok' : ''}`, `<i>${ok ? CHECK : ''}</i>`);
        celda.append(CARTA.comidas[c]);
        return celda;
      })),
      barra,
    );
    comido.href = '/dieta';
    comido.setAttribute('aria-label', `Lo que llevas comido: ${Math.round(prot)} de ${obj} gramos de proteína. Abrir la dieta`);
    tarjetas.push(comido);
  }

  // ── El mes en estrellas ──
  const { on, total } = estrellasMes(d.entrenosMes, d.objetivoSemana, fecha.getFullYear(), fecha.getMonth());
  const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
  const estrellas = el('div', 'gm-estrellas');
  estrellas.setAttribute('role', 'img');
  estrellas.setAttribute('aria-label', `${on} de ${total} estrellas`);
  for (let i = 0; i < total; i++) estrellas.insertAdjacentHTML('beforeend', ESTRELLA.replace('<svg', `<svg class="${i < on ? 'gm-on' : 'gm-off'}"`));
  tarjetas.push(
    el(
      'section',
      'card',
      fila(mes[0].toUpperCase() + mes.slice(1), d.entrenosMes === 1 ? '1 entreno' : `${d.entrenosMes} entrenos`),
      estrellas,
      el('p', 'gm-frase', fraseMes(d.entrenosMes, d.hoy)),
    ),
  );

  cont.replaceChildren(sub, el('div', 'gm-cont', ...tarjetas));
}
