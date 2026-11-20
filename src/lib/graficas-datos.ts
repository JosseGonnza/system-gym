// Gráficas del centro de datos, en SVG a mano: columnas, línea, barras
// horizontales y calendario de calor. Una serie por gráfica (oro), rejilla
// recesiva y un tooltip compartido que se rellena con textContent.

const NS = 'http://www.w3.org/2000/svg';
const ORO = '#dcb768';
const MARFIL = '#efe9dc';
const REJILLA = '#2c2924';
const MUT = '#9c968a';
const SUPERFICIE = '#0f0e0c';

type Attrs = Record<string, string | number>;
function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, ...hijos: Node[]): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  e.append(...hijos);
  return e;
}
const texto = (t: string, attrs: Attrs) => {
  const e = svgEl('text', attrs);
  e.textContent = t;
  return e;
};

// ── Tooltip compartido ──
let tip: HTMLDivElement | null = null;
export interface LineaTip {
  valor: string;
  etiqueta: string;
}
function tooltip(): HTMLDivElement {
  if (tip) return tip;
  tip = document.createElement('div');
  tip.className = 'g-tip';
  tip.setAttribute('role', 'status');
  document.body.append(tip);
  return tip;
}
export function mostrarTip(x: number, y: number, titulo: string, filas: LineaTip[]): void {
  const t = tooltip();
  const h = document.createElement('p');
  h.className = 'g-tip-t';
  h.textContent = titulo;
  t.replaceChildren(
    h,
    ...filas.map((f) => {
      const p = document.createElement('p');
      const b = document.createElement('b');
      b.textContent = f.valor;
      const s = document.createElement('span');
      s.textContent = f.etiqueta;
      p.append(b, s);
      return p;
    }),
  );
  t.classList.add('on');
  const r = t.getBoundingClientRect();
  const left = Math.min(window.innerWidth - r.width - 12, x + 14);
  const top = y - r.height - 14 < 8 ? y + 18 : y - r.height - 14;
  t.style.transform = `translate(${Math.max(8, left)}px, ${top}px)`;
}
export function ocultarTip(): void {
  tip?.classList.remove('on');
}

const ancho = (cont: HTMLElement) => Math.max(280, Math.floor(cont.clientWidth));

// Marcas limpias para el eje: 0, 5, 10… o 0, 2.000, 4.000…
function ticks(max: number, n = 4): number[] {
  if (max <= 0) return [0];
  const paso0 = max / n;
  const mag = 10 ** Math.floor(Math.log10(paso0));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= paso0)!;
  const out: number[] = [];
  for (let v = 0; v <= max + paso * 0.001; v += paso) out.push(Math.round(v * 1000) / 1000);
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + paso);
  return out;
}
const compacto = (v: number) => (v >= 10_000 ? `${Math.round(v / 1000)}K` : v.toLocaleString('es-ES', { maximumFractionDigits: 1 }));

// ── Columnas (una por semana) ──
export interface Columna {
  x: string;
  y: number;
  // Segunda parte apilada encima (p. ej. lo de fuera de lista), en marfil.
  y2?: number;
  titulo: string;
  filas: LineaTip[];
}
export function columnas(cont: HTMLElement, datos: Columna[], o: { objetivo?: number; objetivoTxt?: string; alPulsar?: (i: number) => void } = {}): void {
  const W = ancho(cont);
  const H = 220;
  const m = { t: 14, r: 12, b: 26, l: 44 };
  const max = Math.max(o.objetivo ?? 0, ...datos.map((d) => d.y + (d.y2 ?? 0)), 1);
  const ts = ticks(max);
  const top = ts[ts.length - 1];
  const y = (v: number) => m.t + (H - m.t - m.b) * (1 - v / top);
  const banda = (W - m.l - m.r) / Math.max(1, datos.length);
  const bw = Math.max(3, Math.min(24, banda - 2));
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'g' });
  for (const t of ts) {
    svg.append(svgEl('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), stroke: REJILLA, 'stroke-width': 1 }));
    svg.append(texto(compacto(t), { x: m.l - 8, y: y(t) + 4, 'text-anchor': 'end', class: 'g-eje' }));
  }
  const cada = Math.ceil(datos.length / Math.max(1, Math.floor((W - m.l) / 64)));
  datos.forEach((d, i) => {
    const cx = m.l + banda * i + banda / 2;
    const h = Math.max(0, y(0) - y(d.y));
    const g = svgEl('g', { class: `g-col${o.alPulsar ? ' g-pulsable' : ''}`, tabindex: 0, role: 'img', 'aria-label': `${d.titulo}: ${d.filas.map((f) => `${f.valor} ${f.etiqueta}`).join(', ')}` });
    g.append(svgEl('rect', { x: m.l + banda * i, y: m.t, width: banda, height: H - m.t - m.b, fill: 'transparent', class: 'g-hit' }));
    const h2 = d.y2 ? Math.max(0, y(d.y) - y(d.y + d.y2)) : 0;
    if (h > 0) {
      // La parte de abajo solo lleva las esquinas redondas si no hay otra encima.
      const r = h2 > 2 ? 0 : Math.min(4, bw / 2, h);
      g.append(svgEl('path', { d: `M${cx - bw / 2} ${y(0)}V${y(d.y) + r}q0 -${r} ${r} -${r}H${cx + bw / 2 - r}q${r} 0 ${r} ${r}V${y(0)}Z`, fill: ORO, class: 'g-barra' }));
    }
    if (h2 > 2) {
      const base = y(d.y) - (h > 0 ? 2 : 0);
      const top2 = y(d.y + d.y2!);
      const r = Math.min(4, bw / 2, base - top2);
      g.append(svgEl('path', { d: `M${cx - bw / 2} ${base}V${top2 + r}q0 -${r} ${r} -${r}H${cx + bw / 2 - r}q${r} 0 ${r} ${r}V${base}Z`, fill: MARFIL, opacity: 0.55, class: 'g-barra' }));
    }
    const enseñar = (ev: PointerEvent | FocusEvent) => {
      const b = (ev.currentTarget as SVGGElement).getBoundingClientRect();
      mostrarTip(ev instanceof PointerEvent ? ev.clientX : b.left + b.width / 2, ev instanceof PointerEvent ? ev.clientY : b.top, d.titulo, d.filas);
    };
    g.addEventListener('pointermove', enseñar);
    g.addEventListener('focus', enseñar);
    g.addEventListener('pointerleave', ocultarTip);
    g.addEventListener('blur', ocultarTip);
    if (o.alPulsar) {
      g.addEventListener('click', () => o.alPulsar!(i));
      g.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          o.alPulsar!(i);
        }
      });
    }
    svg.append(g);
    if (i % cada === 0) svg.append(texto(d.x, { x: cx, y: H - 8, 'text-anchor': 'middle', class: 'g-eje' }));
  });
  if (o.objetivo) {
    svg.append(svgEl('line', { x1: m.l, x2: W - m.r, y1: y(o.objetivo), y2: y(o.objetivo), stroke: MARFIL, 'stroke-width': 1, 'stroke-dasharray': '4 4', opacity: 0.6, 'pointer-events': 'none' }));
    if (o.objetivoTxt) svg.append(texto(o.objetivoTxt, { x: W - m.r, y: y(o.objetivo) - 6, 'text-anchor': 'end', class: 'g-eje g-eje-hi' }));
  }
  svg.append(svgEl('line', { x1: m.l, x2: W - m.r, y1: y(0), y2: y(0), stroke: '#4a443a', 'stroke-width': 1 }));
  cont.replaceChildren(svg);
}

// ── Línea en el tiempo, con crosshair ──
export interface Punto {
  fecha: string;
  y: number;
  destacar?: boolean;
  titulo: string;
  filas: LineaTip[];
}
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const ms = (f: string) => Date.parse(`${f}T12:00:00Z`);

export function linea(cont: HTMLElement, puntos: Punto[], o: { fondo?: { fecha: string; y: number }[]; unidad?: string; banda?: [number, number] } = {}): void {
  const W = ancho(cont);
  const H = 220;
  const m = { t: 16, r: 16, b: 26, l: 44 };
  if (!puntos.length) {
    cont.replaceChildren(Object.assign(document.createElement('p'), { className: 'g-vacio', textContent: 'Sin datos con estos filtros.' }));
    return;
  }
  const todos = [...puntos.map((p) => p.y), ...(o.fondo ?? []).map((p) => p.y), ...(o.banda ?? [])];
  let lo = Math.min(...todos);
  let hi = Math.max(...todos);
  const pad = Math.max(0.5, (hi - lo) * 0.12);
  lo -= pad;
  hi += pad;
  const t0 = ms(puntos[0].fecha);
  const t1 = Math.max(t0 + 86_400_000, ms(puntos[puntos.length - 1].fecha));
  const x = (f: string) => m.l + ((ms(f) - t0) / (t1 - t0)) * (W - m.l - m.r);
  const y = (v: number) => m.t + (H - m.t - m.b) * (1 - (v - lo) / (hi - lo));
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'g' });
  const paso = (hi - lo) / 4;
  for (let i = 0; i <= 4; i++) {
    const v = lo + paso * i;
    svg.append(svgEl('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: REJILLA, 'stroke-width': 1 }));
    svg.append(texto(v.toLocaleString('es-ES', { maximumFractionDigits: hi - lo < 10 ? 1 : 0 }), { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'g-eje' }));
  }
  if (o.banda) svg.append(svgEl('rect', { x: m.l, width: W - m.l - m.r, y: y(o.banda[1]), height: y(o.banda[0]) - y(o.banda[1]), fill: ORO, opacity: 0.08 }));
  const d0 = new Date(t0);
  for (let d = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + 1, 1)); d.getTime() <= t1; d.setUTCMonth(d.getUTCMonth() + 1)) {
    const f = d.toISOString().slice(0, 10);
    svg.append(texto(MESES[d.getUTCMonth()], { x: x(f), y: H - 8, 'text-anchor': 'middle', class: 'g-eje' }));
  }
  if (o.fondo?.length) {
    for (const p of o.fondo) svg.append(svgEl('circle', { cx: x(p.fecha), cy: y(p.y), r: 2.5, fill: MUT, opacity: 0.55 }));
  }
  const d = puntos.map((p, i) => `${i ? 'L' : 'M'}${x(p.fecha).toFixed(1)} ${y(p.y).toFixed(1)}`).join('');
  svg.append(svgEl('path', { d, fill: 'none', stroke: ORO, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  for (const p of puntos.filter((q) => q.destacar)) svg.append(svgEl('circle', { cx: x(p.fecha), cy: y(p.y), r: 4.5, fill: ORO, stroke: SUPERFICIE, 'stroke-width': 2 }));
  const ult = puntos[puntos.length - 1];
  svg.append(svgEl('circle', { cx: x(ult.fecha), cy: y(ult.y), r: 4.5, fill: ORO, stroke: SUPERFICIE, 'stroke-width': 2 }));
  svg.append(texto(`${ult.y.toLocaleString('es-ES', { maximumFractionDigits: 1 })}${o.unidad ?? ''}`, { x: Math.min(W - m.r, x(ult.fecha)), y: y(ult.y) - 10, 'text-anchor': 'end', class: 'g-valor' }));

  // Crosshair: la vertical salta al punto más cercano.
  const cruz = svgEl('line', { y1: m.t, y2: H - m.b, stroke: MARFIL, 'stroke-width': 1, opacity: 0, 'pointer-events': 'none' });
  const foco = svgEl('circle', { r: 5, fill: ORO, stroke: SUPERFICIE, 'stroke-width': 2, opacity: 0, 'pointer-events': 'none' });
  const zona = svgEl('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent', tabindex: 0, class: 'g-zona' });
  let actual = puntos.length - 1;
  const marcar = (i: number, cx: number, cy: number) => {
    actual = i;
    const p = puntos[i];
    for (const [k, v] of Object.entries({ x1: x(p.fecha), x2: x(p.fecha) })) cruz.setAttribute(k, String(v));
    foco.setAttribute('cx', String(x(p.fecha)));
    foco.setAttribute('cy', String(y(p.y)));
    cruz.setAttribute('opacity', '0.5');
    foco.setAttribute('opacity', '1');
    mostrarTip(cx, cy, p.titulo, p.filas);
  };
  const cercano = (px: number) => {
    let mejor = 0;
    puntos.forEach((p, i) => {
      if (Math.abs(x(p.fecha) - px) < Math.abs(x(puntos[mejor].fecha) - px)) mejor = i;
    });
    return mejor;
  };
  zona.addEventListener('pointermove', (ev) => {
    const r = svg.getBoundingClientRect();
    const i = cercano(((ev.clientX - r.left) / r.width) * W);
    marcar(i, ev.clientX, r.top + (y(puntos[i].y) / H) * r.height);
  });
  const quitar = () => {
    cruz.setAttribute('opacity', '0');
    foco.setAttribute('opacity', '0');
    ocultarTip();
  };
  zona.addEventListener('pointerleave', quitar);
  zona.addEventListener('blur', quitar);
  zona.addEventListener('keydown', (ev) => {
    if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
    ev.preventDefault();
    const i = Math.max(0, Math.min(puntos.length - 1, actual + (ev.key === 'ArrowLeft' ? -1 : 1)));
    const r = svg.getBoundingClientRect();
    marcar(i, r.left + (x(puntos[i].fecha) / W) * r.width, r.top + (y(puntos[i].y) / H) * r.height);
  });
  svg.append(cruz, foco, zona);
  cont.replaceChildren(svg);
}

// ── Barras horizontales con una franja de referencia ──
export function barrasH(cont: HTMLElement, items: { nombre: string; valor: number; detalle: string }[], o: { franja?: [number, number]; franjaTxt?: string; unidad?: string; alPulsar?: (nombre: string) => void } = {}): void {
  if (!items.length) {
    cont.replaceChildren(Object.assign(document.createElement('p'), { className: 'g-vacio', textContent: 'Sin datos con estos filtros.' }));
    return;
  }
  const W = ancho(cont);
  const m = { t: 18, r: 56, l: 92 };
  // Rellena el alto que le deja la tarjeta (la fila de la rejilla la marca la
  // tarjeta vecina), con filas entre 26 y 48 px.
  cont.replaceChildren();
  const disponible = cont.clientHeight;
  const fila = Math.max(26, Math.min(48, Math.floor((disponible - m.t - 6) / items.length)));
  const grosor = Math.min(24, Math.round(fila * 0.55));
  const H = m.t + fila * items.length + 6;
  const max = Math.max(o.franja?.[1] ?? 0, ...items.map((i) => i.valor), 1) * 1.05;
  const x = (v: number) => m.l + (v / max) * (W - m.l - m.r);
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'g' });
  if (o.franja) {
    svg.append(svgEl('rect', { x: x(o.franja[0]), width: x(o.franja[1]) - x(o.franja[0]), y: m.t - 6, height: H - m.t, fill: ORO, opacity: 0.08 }));
    if (o.franjaTxt) svg.append(texto(o.franjaTxt, { x: (x(o.franja[0]) + x(o.franja[1])) / 2, y: m.t - 8, 'text-anchor': 'middle', class: 'g-eje g-eje-hi' }));
  }
  items.forEach((it, i) => {
    const cy = m.t + fila * i + fila / 2;
    const g = svgEl('g', { class: `g-col${o.alPulsar ? ' g-pulsable' : ''}`, tabindex: 0, role: 'img', 'aria-label': `${it.nombre}: ${it.detalle}` });
    g.append(svgEl('rect', { x: 0, y: cy - fila / 2, width: W, height: fila, fill: 'transparent', class: 'g-hit' }));
    g.append(texto(it.nombre, { x: m.l - 10, y: cy + 4.5, 'text-anchor': 'end', class: fila >= 36 ? 'g-cat g-cat-xl' : 'g-cat' }));
    const w = Math.max(0, x(it.valor) - m.l);
    if (w > 0) {
      const r = Math.min(4, w);
      const g2 = grosor / 2;
      g.append(svgEl('path', { d: `M${m.l} ${cy - g2}H${m.l + w - r}q${r} 0 ${r} ${r}V${cy + g2 - r}q0 ${r} -${r} ${r}H${m.l}Z`, fill: ORO, class: 'g-barra' }));
    }
    g.append(texto(`${it.valor.toLocaleString('es-ES', { maximumFractionDigits: 1 })}${o.unidad ?? ''}`, { x: m.l + w + 8, y: cy + 4, class: 'g-valor' }));
    const enseñar = (ev: PointerEvent | FocusEvent) => {
      const b = (ev.currentTarget as SVGGElement).getBoundingClientRect();
      mostrarTip(ev instanceof PointerEvent ? ev.clientX : b.left + 120, ev instanceof PointerEvent ? ev.clientY : b.top, it.nombre, [{ valor: it.detalle, etiqueta: '' }]);
    };
    g.addEventListener('pointermove', enseñar);
    g.addEventListener('focus', enseñar);
    g.addEventListener('pointerleave', ocultarTip);
    g.addEventListener('blur', ocultarTip);
    if (o.alPulsar) {
      g.addEventListener('click', () => o.alPulsar!(it.nombre));
      g.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          o.alPulsar!(it.nombre);
        }
      });
    }
    svg.append(g);
  });
  cont.replaceChildren(svg);
}

// ── Calendario de calor: 53 semanas × 7 días, el tono por tonelaje ──
const RAMPA = ['#1c1a16', '#3d3221', '#6e5529', '#a8823f', '#dcb768'];
export function calor(cont: HTMLElement, dias: Map<string, number>, hasta: string, alPulsar?: (fecha: string) => void): void {
  const W = ancho(cont);
  const semanas = 53;
  const m = { t: 18, l: 26, r: 4 };
  const lado = Math.max(8, Math.min(22, Math.floor((W - m.l - m.r) / semanas) - 2));
  const paso = lado + 2;
  const H = m.t + paso * 7 + 26;
  const fin = Date.parse(`${hasta}T12:00:00Z`);
  const dow = (new Date(fin).getUTCDay() + 6) % 7;
  const inicio = fin - (dow + 7 * (semanas - 1)) * 86_400_000;
  const vals = [...dias.values()].filter((v) => v > 0).sort((a, b) => a - b);
  const cuartil = (q: number) => vals[Math.min(vals.length - 1, Math.floor(q * vals.length))] ?? 0;
  const cortes = [cuartil(0.25), cuartil(0.5), cuartil(0.75)];
  const nivel = (v: number) => (v <= 0 ? 0 : v <= cortes[0] ? 1 : v <= cortes[1] ? 2 : v <= cortes[2] ? 3 : 4);
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'g' });
  ['L', 'X', 'V'].forEach((l, i) => svg.append(texto(l, { x: 0, y: m.t + paso * (i * 2) + lado - 2, class: 'g-eje' })));
  let mesPrev = -1;
  for (let s = 0; s < semanas; s++) {
    for (let d = 0; d < 7; d++) {
      const t = inicio + (s * 7 + d) * 86_400_000;
      if (t > fin) continue;
      const f = new Date(t).toISOString().slice(0, 10);
      const v = dias.get(f) ?? 0;
      const cx = m.l + s * paso;
      const cy = m.t + d * paso;
      if (d === 0 && new Date(t).getUTCMonth() !== mesPrev) {
        mesPrev = new Date(t).getUTCMonth();
        if (s < semanas - 2) svg.append(texto(MESES[mesPrev], { x: cx, y: m.t - 6, class: 'g-eje' }));
      }
      const r = svgEl('rect', { x: cx, y: cy, width: lado, height: lado, rx: 3, fill: RAMPA[nivel(v)], class: v > 0 ? 'g-dia g-pulsable' : 'g-dia', tabindex: v > 0 ? 0 : -1 });
      if (v > 0) {
        const titulo = new Date(t).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
        const filas = [{ valor: `${v.toLocaleString('es-ES', { maximumFractionDigits: 0 })} kg`, etiqueta: 'tonelaje' }];
        r.setAttribute('aria-label', `${titulo}: ${filas[0].valor}`);
        const enseñar = () => {
          const b = r.getBoundingClientRect();
          mostrarTip(b.left + b.width / 2, b.top, titulo, filas);
        };
        r.addEventListener('pointermove', enseñar);
        r.addEventListener('focus', enseñar);
        r.addEventListener('pointerleave', ocultarTip);
        r.addEventListener('blur', ocultarTip);
        if (alPulsar) r.addEventListener('click', () => alPulsar(f));
      }
      svg.append(r);
    }
  }
  const ly = H - 8;
  svg.append(texto('Menos', { x: W - m.r - 30 - 5 * (lado + 3) - 8, y: ly, 'text-anchor': 'end', class: 'g-eje' }));
  RAMPA.forEach((c, i) => svg.append(svgEl('rect', { x: W - m.r - 30 - (5 - i) * (lado + 3), y: ly - lado + 2, width: lado, height: lado, rx: 3, fill: c })));
  svg.append(texto('Más', { x: W - m.r, y: ly, 'text-anchor': 'end', class: 'g-eje' }));
  cont.replaceChildren(svg);
}
