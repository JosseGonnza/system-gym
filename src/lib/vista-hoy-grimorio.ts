// Hoy del Grimorio (perfil de Yasmina): decidir qué toca, cómo va la semana,
// qué ha comido y cómo va el mes. Sustituye a la tarjeta del modo sencillo solo
// en su perfil; index.astro carga este módulo con import dinámico.

import { CARTA, COMIDAS, diaCiclo, racion } from './casa';
import type { DiaComidas } from './comidas';
import { GATO, bolaCristal } from './dibujos-grimorio';
import { estrellasMes, faseLunar, fraseMes, lunasSemana, nombreBonito, nombreCorto, type Luna } from './grimorio';
import { iconoDeDia } from './iconos';
import { svgTrazo } from './iconos-trazo';
import { el } from './dom';
import type { DiaDef, EjercicioDef, Rutina, Sesion } from './types';

export interface DatosHoyGrimorio {
  hoy: string;
  rutina: Rutina;
  rutinas: Rutina[];
  dia: DiaDef;
  hecho: boolean;
  sugerido: boolean;
  pesoDe: (e: EjercicioDef) => string;
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

const PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ESTRELLA = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M12 2l1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-1.8z"/></svg>';

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

  const lista = el(
    'div',
    'gm-lista',
    ...d.dia.ejercicios.map((e) => el('div', 'gm-ex', el('span', 'gm-n', e.nombre), el('span', 'gm-gu'), el('span', 'gm-v', d.pesoDe(e)))),
  );

  const hero = el('section', 'card glow gm-hero');
  hero.insertAdjacentHTML('beforeend', GATO);
  hero.append(cab, lista);
  if (!d.hecho) {
    const btn = el('a', 'btn gm-empezar');
    btn.href = '/entreno#empezar';
    btn.innerHTML = `${PLAY}Empezar entreno`;
    hero.append(btn);
  }
  // Las alternativas abren su página del Grimorio (paso 5); desde ahí se empieza.
  const otras = d.rutina.dias.filter((x) => x.id !== d.dia.id);
  if (otras.length) {
    hero.append(
      el(
        'div',
        'gm-alt',
        ...otras.map((x) => {
          const a = el('a', 'gm-pill');
          a.href = `/entreno#pagina-${x.id}`;
          a.innerHTML = svgTrazo(x.fueraDeRueda ? 'dia-cardio' : 'nav-entreno', 14);
          a.append(nombreCorto(x.nombre));
          return a;
        }),
      ),
    );
  }

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
  );

  const tarjetas: HTMLElement[] = [hero, semana];

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
