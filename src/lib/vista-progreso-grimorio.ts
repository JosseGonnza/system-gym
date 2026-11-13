// Progreso de Yasmina: el diario. Solo mirar, salvo un botón para anotar peso o
// cintura. La racha con el gato dormido, el año en estrellas (un mes se abre en
// grande al tocarlo), peso y cintura en una gráfica, dieta y peso (#29) y las
// marcas. progreso.astro lo carga con import dinámico.

import { GATO_DUERME } from './dibujos-grimorio';
import { capitulos, cielo, marca, mediasSemanales, racha, tendenciaSemanal, type DiaCielo } from './grimorio';
import { svgTrazo } from './iconos-trazo';
import { boton, el } from './dom';
import type { EjercicioDef, Mediciones, Rutina, Sesion } from './types';

export interface DatosDiario {
  hoy: string;
  rutina: Rutina;
  rutinas: Rutina[];
  sesiones: Sesion[];
  objetivoSemana: number;
  mediciones: Mediciones;
  guardarMediciones: (m: Mediciones) => Promise<void>;
  pesoDieta: (root: HTMLElement, m: Mediciones) => void;
}

const num = (n: number, dec = 1) => n.toLocaleString('es-ES', { maximumFractionDigits: dec });
const fecha = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-ES', o);
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const NUMEROS = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete'];
const fila = (izq: string, der: Node | string) => el('div', 'gm-fila', el('span', 'eyebrow', izq), typeof der === 'string' ? el('span', 'gm-meta', der) : der);

const ESTRELLA = (x: number) => `<path d="M${x} 0.6l.9 2.6 2.6.8-2.6.8-.9 2.6-.9-2.6-2.6-.8 2.6-.8z" fill="#ecd398"/>`;

function puntoCielo(d: DiaCielo, x: number): string {
  if (d.tipo === 'entreno') return ESTRELLA(x);
  if (d.tipo === 'suave') return `<circle cx="${x}" cy="4" r="2" fill="#ee9a5f"/>`;
  return `<circle cx="${x}" cy="4" r="${d.futuro ? 0.8 : 1.1}" fill="rgb(207 174 102 / ${d.futuro ? 0.12 : 0.22})"/>`;
}

// Un mes abierto en grande: su calendario de lunes a domingo
function mesGrande(dias: DiaCielo[]): HTMLElement {
  const hueco = (new Date(`${dias[0].fecha}T12:00:00`).getDay() + 6) % 7;
  const rejilla = el('div', 'gm-mg', ...'LMXJVSD'.split('').map((l) => el('span', 'gm-mg-l', l)));
  for (let i = 0; i < hueco; i++) rejilla.append(el('span'));
  for (const d of dias) {
    const c = el('span', `gm-mg-d gm-mg-${d.tipo}${d.futuro ? ' gm-mg-futuro' : ''}`);
    c.innerHTML =
      d.tipo === 'entreno'
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-1.8z"/></svg>'
        : '';
    c.append(el('small', '', String(Number(d.fecha.slice(-2)))));
    c.title = `${fecha(d.fecha, { day: 'numeric', month: 'long' })}${d.tipo === 'entreno' ? ' · entreno' : d.tipo === 'suave' ? ' · día suave' : ''}`;
    rejilla.append(c);
  }
  return rejilla;
}

// Peso o cintura: medias de cada semana, con la última en cobre y la tendencia.
function grafica(medias: { lunes: string; media: number }[], unidad: string): HTMLElement {
  const caja = el('div', 'gm-graf');
  if (medias.length < 2) {
    caja.append(el('p', 'gm-graf-vacia', medias.length ? `Primera semana: ${num(medias[0].media)} ${unidad}. Con la segunda sale la línea.` : 'Aún no hay nada anotado.'));
    return caja;
  }
  const W = 300;
  const H = 130;
  const L = 34;
  const B = 22;
  const T = 12;
  const vs = medias.map((m) => m.media);
  let lo = Math.floor(Math.min(...vs));
  let hi = Math.ceil(Math.max(...vs));
  if (hi - lo < 2) {
    lo -= 1;
    hi += 1;
  }
  const paso = Math.max(1, Math.ceil((hi - lo) / 3));
  const y = (v: number) => T + ((hi - v) / (hi - lo)) * (H - T - B);
  const x = (i: number) => L + (i * (W - L - 10)) / (medias.length - 1);
  const pts = medias.map((m, i) => [x(i), y(m.media)]);
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
  let rejilla = '';
  for (let v = lo; v <= hi; v += paso)
    rejilla += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="rgb(207 174 102 / .1)"/><text x="0" y="${y(v) + 3}">${v} ${unidad}</text>`;
  for (const i of [...new Set([0, Math.floor((medias.length - 1) / 2), medias.length - 1])])
    rejilla += `<text x="${x(i) - 10}" y="${H - 4}">${MESES[Number(medias[i].lunes.slice(5, 7)) - 1]}</text>`;
  const [lx, ly] = pts[pts.length - 1];
  const t = tendenciaSemanal(medias);
  const tend = t == null ? '' : `<text x="${W - 70}" y="${T}" class="gm-graf-t">${t > 0 ? '+' : t < 0 ? '−' : ''}${num(Math.abs(t))} / sem</text>`;
  caja.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Media semanal: ${num(medias[medias.length - 1].media)} ${unidad}">${rejilla}<path d="${d} L${lx} ${H - B} L${L} ${H - B}Z" fill="rgb(207 174 102 / .1)"/><path d="${d}" fill="none" stroke="#cfae66" stroke-width="2" stroke-linejoin="round"/>${pts
    .map((q) => `<circle cx="${q[0]}" cy="${q[1]}" r="2" fill="#0a110d" stroke="#cfae66" stroke-width="1.3"/>`)
    .join('')}<circle cx="${lx}" cy="${ly}" r="4" fill="#ee9a5f"/><text x="${Math.max(L, lx - 40)}" y="${ly - 9}" class="gm-graf-v">${num(medias[medias.length - 1].media)} ${unidad}</text>${tend}</svg>`;
  return caja;
}

function linea(v: number[], w = 130, h = 44): string {
  if (v.length < 2) return '';
  const p = 4;
  const min = Math.min(...v);
  const r = Math.max(...v) - min || 1;
  const pts = v.map((y, i) => [p + (i * (w - 2 * p)) / (v.length - 1), h - p - ((y - min) / r) * (h - 2 * p)]);
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  return `<svg class="gm-marca-linea" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d} L${lx} ${h} L${pts[0][0]} ${h}Z" fill="rgb(207 174 102 / .12)"/><path d="${d}" fill="none" stroke="#cfae66" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${lx}" cy="${ly}" r="3" fill="#ee9a5f"/></svg>`;
}

export function pintarDiario(cont: HTMLElement, d: DatosDiario): void {
  const est = { mes: null as number | null, medida: 'peso' as 'peso' | 'cintura', ranura: '' };
  const anio = Number(d.hoy.slice(0, 4));
  const mesHoy = Number(d.hoy.slice(5, 7)) - 1;
  const ejercicios = d.rutina.dias
    .flatMap((x) => x.ejercicios)
    .filter((e, i, todos) => todos.findIndex((y) => y.ranuraId === e.ranuraId) === i);
  est.ranura = ejercicios.find((e) => marca(d.sesiones, e.ranuraId, e.tipoProgresion === 'tiempo'))?.ranuraId ?? ejercicios[0]?.ranuraId ?? '';

  const hoja = el('dialog', 'gm-hoja');
  hoja.setAttribute('aria-label', 'Anotar peso o cintura');

  const pintar = () => {
    const n = capitulos(d.sesiones);
    const primera = d.sesiones.filter((s) => s.estado === 'finalizada').map((s) => s.fecha).sort()[0];
    const sub = el(
      'p',
      'gm-sub',
      primera ? el('em', '', `desde el ${fecha(primera, { day: 'numeric', month: 'long' })}`) : el('em', '', 'tu diario empieza hoy'),
      ` · ${n} ${n === 1 ? 'entreno' : 'entrenos'}`,
    );

    // ── Racha ──
    const r = racha(d.sesiones, d.rutinas, d.objetivoSemana, d.hoy);
    const enLetra = NUMEROS[d.objetivoSemana] ?? String(d.objetivoSemana);
    const tarjetaRacha = el(
      'section',
      'card glow gm-racha',
      el('span', 'gm-big', String(r.actual)),
      el(
        'p',
        '',
        el('b', '', r.actual === 1 ? 'semana seguida' : 'semanas seguidas'),
        r.actual
          ? `con tus ${enLetra} entrenos.${r.mejor > r.actual ? ` La mejor racha fueron ${r.mejor}.` : ' Es tu mejor racha.'}`
          : `Una semana con tus ${enLetra} entrenos enciende la primera.${r.mejor ? ` La mejor fueron ${r.mejor}.` : ''}`,
      ),
    );
    tarjetaRacha.insertAdjacentHTML('afterbegin', GATO_DUERME);

    // ── Tu año en estrellas ──
    const meses = cielo(d.sesiones, d.rutinas, anio, d.hoy);
    const filas = meses.flatMap((dias, m) => {
      const b = boton(`gm-mesfila${m === mesHoy ? ' gm-actual' : ''}${est.mes === m ? ' gm-abierta' : ''}`, el('span', '', MESES[m]), () => {
        est.mes = est.mes === m ? null : m;
        pintar();
      });
      b.setAttribute('aria-expanded', String(est.mes === m));
      b.setAttribute('aria-label', `${MESES[m]}: ${dias.filter((x) => x.tipo === 'entreno').length} entrenos`);
      b.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 266 8" preserveAspectRatio="xMinYMid meet" aria-hidden="true">${dias.map((x, i) => puntoCielo(x, 4 + i * 8.4)).join('')}</svg>`);
      return est.mes === m ? [b, mesGrande(dias)] : [b];
    });
    const leyenda = el('div', 'gm-leyenda');
    leyenda.innerHTML = '<span><i style="background:#ecd398"></i>entreno</span><span><i style="background:#ee9a5f"></i>día suave</span><span><i style="background:rgb(207 174 102 / .3)"></i>descanso</span>';
    const tarjetaCielo = el('section', 'card', fila(`Tu ${anio} en estrellas`, 'toca un mes'), el('div', 'gm-cielo', ...filas), leyenda);

    // ── Peso / cintura ──
    const entradas =
      est.medida === 'peso'
        ? d.mediciones.peso.map((e) => ({ fecha: e.fecha, v: e.kg }))
        : d.mediciones.cintura.map((e) => ({ fecha: e.fecha, v: e.cm }));
    const pestanas = el(
      'div',
      'gm-tabs-mini',
      ...(['peso', 'cintura'] as const).map((m) => {
        const b = boton(est.medida === m ? 'gm-on' : '', m === 'peso' ? 'Peso' : 'Cintura', () => {
          est.medida = m;
          pintar();
        });
        b.setAttribute('aria-pressed', String(est.medida === m));
        return b;
      }),
    );
    const anotar = boton('btn-2 gm-anotar', 'Anotar peso o cintura', () => abrirHoja());
    anotar.insertAdjacentHTML('afterbegin', svgTrazo('medidas', 18));
    const tarjetaMedidas = el(
      'section',
      'card',
      fila(est.medida === 'peso' ? 'Peso' : 'Cintura', pestanas),
      grafica(mediasSemanales(entradas), est.medida === 'peso' ? 'kg' : 'cm'),
      anotar,
    );

    // ── Dieta y peso (#29), con la piel ──
    const tarjetaDieta = el('section', 'card');
    d.pesoDieta(tarjetaDieta, d.mediciones);

    // ── Marcas ──
    const ej = ejercicios.find((e) => e.ranuraId === est.ranura);
    const sel = el('select', 'gm-sel');
    sel.setAttribute('aria-label', 'Ejercicio');
    for (const e of ejercicios) {
      const o = el('option', '', e.nombre);
      o.value = e.ranuraId;
      o.selected = e.ranuraId === est.ranura;
      sel.append(o);
    }
    sel.addEventListener('change', () => {
      est.ranura = sel.value;
      pintar();
    });
    const tarjetaMarcas = el('section', 'card', fila('Marcas', ''), sel, ej ? marcaEl(ej) : el('p', 'gm-graf-vacia', 'Sin ejercicios.'));

    cont.replaceChildren(sub, el('div', 'gm-cont gm-cont-diario', tarjetaRacha, tarjetaCielo, tarjetaMedidas, tarjetaDieta, tarjetaMarcas), hoja);
  };

  function marcaEl(e: EjercicioDef): HTMLElement {
    const porTiempo = e.tipoProgresion === 'tiempo';
    const m = marca(d.sesiones, e.ranuraId, porTiempo);
    const caja = el('div', 'gm-marca');
    if (!m) {
      caja.append(el('p', 'gm-graf-vacia', 'Todavía sin marcas: aparecen al terminar la primera sesión con este ejercicio.'));
      return caja;
    }
    const u = porTiempo ? 's' : 'kg';
    const dif = m.actual - m.primera.v;
    const desde = fecha(m.primera.fecha, { month: 'long' });
    const texto =
      m.ultimos.length < 2 ? 'tu primera marca' : dif > 0 ? `▲ ${num(dif, 2)} ${u} desde ${desde}` : dif < 0 ? `▼ ${num(-dif, 2)} ${u} desde ${desde}` : `igual que en ${desde}`;
    caja.append(el('div', '', el('b', '', `${num(m.actual, 2)} ${u}`), el('small', dif > 0 ? 'gm-sube' : 'gm-igual', texto)));
    caja.insertAdjacentHTML('beforeend', linea(m.ultimos));
    return caja;
  }

  // La hoja de anotar: peso y cintura de hoy (vacío = sin dato) y las últimas,
  // con su papelera, para corregir.
  function abrirHoja() {
    const deHoy = <T extends { fecha: string }>(xs: T[]) => xs.find((x) => x.fecha === d.hoy);
    const campo = (id: string, etiqueta: string, unidad: string, valor: number | undefined, paso: string) => {
      const input = el('input', 'num');
      input.id = id;
      input.type = 'number';
      input.inputMode = 'decimal';
      input.step = paso;
      input.value = valor != null ? String(valor) : '';
      const lab = el('label', 'gm-campo', el('span', '', etiqueta), input, el('small', '', unidad));
      lab.htmlFor = id;
      return { lab, input };
    };
    const peso = campo('gm-in-peso', 'Peso', 'kg, en ayunas', deHoy(d.mediciones.peso)?.kg, '0.1');
    const cintura = campo('gm-in-cintura', 'Cintura', 'cm, a la altura del ombligo', deHoy(d.mediciones.cintura)?.cm, '0.5');

    const leer = (i: HTMLInputElement) => {
      const v = i.value === '' ? null : Number(i.value.replace(',', '.'));
      return v != null && Number.isFinite(v) && v > 0 ? v : null;
    };
    const guardar = boton('btn', 'Guardar', async () => {
      const kg = leer(peso.input);
      const cm = leer(cintura.input);
      const m: Mediciones = {
        peso: [...d.mediciones.peso.filter((x) => x.fecha !== d.hoy), ...(kg ? [{ fecha: d.hoy, kg }] : [])],
        cintura: [...d.mediciones.cintura.filter((x) => x.fecha !== d.hoy), ...(cm ? [{ fecha: d.hoy, cm }] : [])],
      };
      await d.guardarMediciones(m);
      d.mediciones = m;
      hoja.close();
      pintar();
    });

    const ultimas = [
      ...d.mediciones.peso.map((x) => ({ fecha: x.fecha, texto: `${num(x.kg)} kg`, tipo: 'peso' as const })),
      ...d.mediciones.cintura.map((x) => ({ fecha: x.fecha, texto: `${num(x.cm)} cm`, tipo: 'cintura' as const })),
    ]
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 6);
    const lista = el(
      'ul',
      'gm-ultimas',
      ...ultimas.map((u) => {
        const borrar = boton('gm-borrar', '', async () => {
          if (!confirm(`¿Borrar ${u.tipo === 'peso' ? 'el peso' : 'la cintura'} del ${fecha(u.fecha, { day: 'numeric', month: 'long' })}?`)) return;
          const m: Mediciones = {
            peso: u.tipo === 'peso' ? d.mediciones.peso.filter((x) => x.fecha !== u.fecha) : d.mediciones.peso,
            cintura: u.tipo === 'cintura' ? d.mediciones.cintura.filter((x) => x.fecha !== u.fecha) : d.mediciones.cintura,
          };
          await d.guardarMediciones(m);
          d.mediciones = m;
          hoja.close();
          pintar();
        });
        borrar.innerHTML = svgTrazo('borrar', 16);
        borrar.setAttribute('aria-label', `Borrar ${u.texto} del ${fecha(u.fecha, { day: 'numeric', month: 'long' })}`);
        return el('li', '', el('span', '', `${fecha(u.fecha, { day: 'numeric', month: 'short' })} · ${u.texto}`), borrar);
      }),
    );

    hoja.replaceChildren(
      el('h2', 'gm-hoja-t', 'Anotar'),
      el('div', 'gm-campos', peso.lab, cintura.lab),
      guardar,
      boton('btn-2', 'Cancelar', () => hoja.close()),
      ...(ultimas.length ? [el('p', 'eyebrow gm-hoja-ceja', 'Las últimas'), lista] : []),
    );
    hoja.showModal();
  }

  pintar();
}
