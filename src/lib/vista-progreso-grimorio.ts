// Progreso de Yasmina: el diario. Solo mirar, salvo un botón para anotar peso o
// cintura. La racha con el gato dormido, el año en estrellas (un mes se abre en
// grande al tocarlo), peso y cintura en una gráfica, dieta y peso (#29) y las
// marcas. progreso.astro lo carga con import dinámico.

import { GATO_DUERME } from './dibujos-grimorio';
import { capitulos, cielo, marca, mediasSemanales, racha, tendenciaSemanal, type DiaCielo } from './grimorio';
import { svgTrazo } from './iconos-trazo';
import { boton, el } from './dom';

const html = <K extends keyof HTMLElementTagNameMap>(tag: K, clase: string, contenido: string) => {
  const e = el(tag, clase);
  e.innerHTML = contenido;
  return e;
};
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
const MESES_LARGOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Posiciones de las estrellas: al azar pero fijas por fecha, para que no
// bailen cada vez que se pinta (hash de la fecha + mulberry32).
const azarDe = (f: string) => {
  let h = 1779033703 ^ f.length;
  for (let i = 0; i < f.length; i++) {
    h = Math.imul(h ^ f.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = Math.imul(h ^ (h >>> 16), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// La rueda del año: 12 porciones con su mes escrito; dentro, una estrella por
// día entrenado (oro) o de cardio (cobre). El mes en curso, con borde cobre.
function ruedaAnio(meses: DiaCielo[][], mesHoy: number, abierto: number | null): string {
  const C = 160;
  const R1 = 58;
  const R2 = 150;
  const pol = (r: number, a: number) => [C + r * Math.cos(a), C + r * Math.sin(a)];
  const ang = (i: number) => -Math.PI / 2 + (i * Math.PI) / 6;
  const porcion = (i: number) => {
    const [x1, y1] = pol(R1, ang(i));
    const [x2, y2] = pol(R2, ang(i));
    const [x3, y3] = pol(R2, ang(i + 1));
    const [x4, y4] = pol(R1, ang(i + 1));
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}A${R2} ${R2} 0 0 1 ${x3.toFixed(1)} ${y3.toFixed(1)}L${x4.toFixed(1)} ${y4.toFixed(1)}A${R1} ${R1} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)}Z`;
  };
  let svg = `<circle cx="${C}" cy="${C}" r="${R2}" class="gm-r-borde"/>`;
  meses.forEach((dias, i) => {
    const n = dias.filter((x) => x.tipo !== 'nada').length;
    const clase = `gm-r-mes${i === mesHoy ? ' gm-r-hoy' : ''}${i === abierto ? ' gm-r-abierto' : ''}`;
    svg += `<path d="${porcion(i)}" class="${clase}" data-mes="${i}" role="button" tabindex="0" aria-label="${MESES_LARGOS[i]}: ${n} ${n === 1 ? 'entreno' : 'entrenos'}"/>`;
  });
  // Repartidas por toda la porción (radio con raíz para que no se amontonen
  // dentro) y sin pisarse: hasta 30 intentos por estrella.
  const rMin = R1 + 10;
  const rMax = R2 - 26;
  meses.forEach((dias, i) => {
    const puestas: [number, number][] = [];
    for (const x of dias) {
      if (x.tipo === 'nada') continue;
      const azar = azarDe(x.fecha);
      let mejor: [number, number] = [0, 0];
      for (let intento = 0, lejos = -1; intento < 30; intento++) {
        const a = ang(i) + 0.07 + azar() * (Math.PI / 6 - 0.14);
        const r = Math.sqrt(rMin * rMin + azar() * (rMax * rMax - rMin * rMin));
        const p = pol(r, a) as [number, number];
        const d = Math.min(Infinity, ...puestas.map(([qx, qy]) => Math.hypot(qx - p[0], qy - p[1])));
        if (d > lejos) [mejor, lejos] = [p, d];
        if (d >= 11) break;
      }
      puestas.push(mejor);
      svg += `<circle cx="${mejor[0].toFixed(1)}" cy="${mejor[1].toFixed(1)}" r="${(1.8 + azar() * 1.4).toFixed(1)}" fill="${x.tipo === 'suave' ? '#ee9a5f' : '#ecd398'}"/>`;
    }
    const [tx, ty] = pol(R2 - 15, ang(i) + Math.PI / 12);
    svg += `<text x="${tx.toFixed(1)}" y="${(ty + 4.5).toFixed(1)}" class="gm-r-txt${i === mesHoy ? ' gm-r-txt-hoy' : ''}">${MESES[i]}</text>`;
  });
  svg += `<circle cx="${C}" cy="${C}" r="38" class="gm-r-centro"/><path d="M172 167A15 15 0 0 1 153 148a15 15 0 1 0 19 19z" fill="#ecd398"/>`;
  return `<svg viewBox="0 0 320 320" width="100%" aria-label="Tu año en una rueda">${svg}</svg>`;
}

// El tarro: una estrella por día entrenado del año, de abajo arriba y por orden;
// las del mes en curso, en cobre.
function tarroEstrellas(meses: DiaCielo[][], mesHoy: number): string {
  const dias = meses.flatMap((ds, m) => ds.filter((x) => x.tipo !== 'nada').map((x) => ({ ...x, m })));
  const POR_FILA = 7;
  const filas = Math.max(1, Math.ceil(dias.length / POR_FILA));
  const alto = Math.min(12, 160 / filas);
  const tam = Math.max(2.5, Math.min(5.5, alto * 0.48));
  const estrella = (cx: number, cy: number, r: number) =>
    `M${cx} ${cy - r}l${r * 0.3} ${r * 0.7} ${r * 0.7} ${r * 0.3}-${r * 0.7} ${r * 0.3}-${r * 0.3} ${r * 0.7}-${r * 0.3}-${r * 0.7}-${r * 0.7}-${r * 0.3} ${r * 0.7}-${r * 0.3}z`;
  const estrellas = dias
    .map((x, k) => {
      const azar = azarDe(x.fecha);
      const fila = Math.floor(k / POR_FILA);
      const cx = 36 + (k % POR_FILA) * 13 + (fila % 2) * 5 + azar() * 3;
      const cy = 194 - fila * alto - azar() * 2;
      return `<path d="${estrella(+cx.toFixed(1), +cy.toFixed(1), +(tam + azar()).toFixed(1))}" fill="${x.m === mesHoy ? '#ee9a5f' : '#ecd398'}"/>`;
    })
    .join('');
  return `<svg viewBox="0 0 150 210" width="130" height="182" aria-hidden="true"><rect x="52" y="6" width="46" height="16" rx="4" fill="#6b5226" stroke="#a8823f"/><path d="M48 24h54v10c18 8 26 22 26 40v108a20 20 0 0 1-20 20H42a20 20 0 0 1-20-20V74c0-18 8-32 26-40z" fill="rgb(236 211 152 / .05)" stroke="rgb(236 211 152 / .45)" stroke-width="1.5"/>${estrellas}<path d="M34 80c0-12 6-22 16-28" fill="none" stroke="rgb(255 250 240 / .25)" stroke-width="3" stroke-linecap="round"/></svg>`;
}
const NUMEROS = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete'];
const fila = (izq: string, der: Node | string) => el('div', 'gm-fila', el('span', 'eyebrow', izq), typeof der === 'string' ? el('span', 'gm-meta', der) : der);

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
    c.title = `${fecha(d.fecha, { day: 'numeric', month: 'long' })}${d.tipo === 'entreno' ? ' · entreno' : d.tipo === 'suave' ? ' · cardio' : ''}`;
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

    // ── Tu año: la rueda (un mes por porción, una estrella por entreno) ──
    const meses = cielo(d.sesiones, d.rutinas, anio, d.hoy);
    const rueda = el('div', 'gm-rueda');
    rueda.innerHTML = ruedaAnio(meses, mesHoy, est.mes);
    rueda.querySelectorAll<SVGPathElement>('[data-mes]').forEach((p) => {
      const m = Number(p.dataset.mes);
      const abrir = () => {
        est.mes = est.mes === m ? null : m;
        pintar();
      };
      p.addEventListener('click', abrir);
      p.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          abrir();
        }
      });
    });
    const leyenda = el('div', 'gm-leyenda');
    leyenda.innerHTML = '<span><i style="background:#ecd398"></i>entreno</span><span><i style="background:#ee9a5f"></i>cardio</span>';
    const tarjetaCielo = el(
      'section',
      'card',
      fila(`Tu ${anio}`, 'toca un mes'),
      rueda,
      est.mes != null ? el('div', 'gm-cielo', el('p', 'gm-mes-abierto', MESES_LARGOS[est.mes]), mesGrande(meses[est.mes])) : null,
      leyenda,
    );

    // ── El tarro: todos los entrenos del año ──
    const total = meses.flat().filter((x) => x.tipo !== 'nada').length;
    const tarro = html('div', 'gm-tarro-svg', tarroEstrellas(meses, mesHoy));
    const tarjetaTarro = el(
      'section',
      'card gm-tarro',
      tarro,
      el(
        'div',
        'gm-tarro-txt',
        el('p', 'gm-tarro-t', `Tu ${anio}`),
        el('p', 'gm-tarro-n', String(total)),
        el('p', '', total === 1 ? 'estrella en el tarro. Una por cada entreno.' : 'estrellas en el tarro. Una por cada entreno.'),
        meses[mesHoy].some((x) => x.tipo !== 'nada') ? el('p', 'gm-tarro-sub', `Las cobrizas son de ${MESES_LARGOS[mesHoy].toLowerCase()}.`) : null,
      ),
    );

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

    cont.replaceChildren(sub, el('div', 'gm-cont gm-cont-diario', tarjetaRacha, tarjetaCielo, tarjetaTarro, tarjetaMedidas, tarjetaDieta, tarjetaMarcas), hoja);
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
