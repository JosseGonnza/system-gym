// Hojas de comida (perfil con seguimiento): se abren desde Hoy y desde Dieta.
// Un <dialog> que sube desde abajo y se quita del DOM al cerrarse.
import { getComidas, patchComidas } from './db';
import {
  ALIMENTOS,
  BLOQUES,
  OPCIONES,
  PLATO,
  PLATO_DEF,
  SEGS,
  SNACK_DIA,
  SNACKS,
  alimento,
  gramos,
  gramosCocido,
  platoMacros,
  type BloqueId,
  type RegComida,
  type SegId,
  type SelPlato,
  type Snack,
} from './comidas';
import { fmtFecha } from './plan-jeik';
import { boton, el } from './dom';

const miles = (n: number) => Math.round(n).toLocaleString('es-ES');

// ---------- Plato ----------
const COLOR: Record<SegId, string> = { prot: 'var(--c-prot)', carb: 'var(--c-carb)', verd: 'var(--c-verd)', gras: 'var(--c-gras)' };

export function platoEl(
  tipo: 'comida' | 'cena',
  sel: SelPlato,
  seg: SegId,
  alCambiar: (sel: SelPlato, seg: SegId) => void,
): HTMLElement {
  const P = PLATO[tipo];
  const R = 70;
  const C = 2 * Math.PI * R;
  const HUECO = 2.5;
  let acc = 0;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Reparto del plato');
  svg.classList.add('plato-svg');
  const borde = document.createElementNS(NS, 'circle');
  for (const [k, v] of Object.entries({ cx: 100, cy: 100, r: 96, class: 'plato-borde' })) borde.setAttribute(k, String(v));
  svg.append(borde);
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('transform', 'rotate(-90 100 100)');
  for (const s of SEGS) {
    const len = (C * P.pct[s.id]) / 100;
    const on = s.id === seg;
    const c = document.createElementNS(NS, 'circle');
    const attrs = {
      cx: 100,
      cy: 100,
      r: R,
      fill: 'none',
      stroke: COLOR[s.id],
      'stroke-width': on ? 40 : 32,
      'stroke-dasharray': `${Math.max(0, len - HUECO).toFixed(2)} ${C.toFixed(2)}`,
      'stroke-dashoffset': (-acc).toFixed(2),
      opacity: on ? 1 : 0.5,
    };
    for (const [k, v] of Object.entries(attrs)) c.setAttribute(k, String(v));
    c.style.cursor = 'pointer';
    c.addEventListener('click', () => alCambiar(sel, s.id));
    g.append(c);
    acc += len;
  }
  svg.append(g);
  const m = platoMacros(sel, tipo);
  const texto = (y: number, cls: string, t: string) => {
    const x = document.createElementNS(NS, 'text');
    for (const [k, v] of Object.entries({ x: 100, y, 'text-anchor': 'middle', class: cls })) x.setAttribute(k, String(v));
    x.textContent = t;
    return x;
  };
  svg.append(texto(98, 'plato-kcal', miles(m.kcal)), texto(116, 'plato-sub', `KCAL · ${Math.round(m.p)} G PROT`));

  const leyenda = el(
    'div',
    'mt-3 grid grid-cols-2 gap-2',
    ...SEGS.map((s) => {
      const a = alimento(s.id, sel[s.id]);
      const gr = gramos(s.id, a, tipo);
      const b = boton(
        `flex items-start gap-2 rounded-xl border p-2 text-left text-xs transition active:scale-[.98] ${s.id === seg ? 'border-vio bg-vio/10' : 'border-line bg-surface2'}`,
        null,
        () => alCambiar(sel, s.id),
      );
      const punto = el('span', 'mt-0.5 h-3 w-3 shrink-0 rounded-full');
      punto.style.background = COLOR[s.id];
      b.append(
        punto,
        el('span', 'min-w-0', el('span', 'block font-bold text-ink', `${s.nombre} · ${P.pct[s.id]} %`), el('span', 'block text-mut', `${gr ? `${gr} g · ` : ''}${a.nombre.toLowerCase()}`)),
      );
      return b;
    }),
  );

  const segNombre = SEGS.find((s) => s.id === seg)!.nombre;
  const opciones = el(
    'div',
    'mt-2 grid gap-2',
    ...ALIMENTOS[seg].map((a) => {
      const gr = gramos(seg, a, tipo);
      const kc = (a.m[3] * gr) / 100;
      const ojo = a.ojo ?? P.ojo[seg as 'prot' | 'carb'] ?? '';
      const cocido = gramosCocido(a, gr);
      const nota = cocido ? `${ojo} · en crudo (≈ ${cocido} g cocido)` : seg === 'prot' ? `${ojo} · en crudo` : ojo;
      const on = sel[seg] === a.id;
      const b = boton(
        `rounded-xl border p-3 text-left text-sm transition active:scale-[.98] ${on ? 'border-vio bg-vio/15' : 'border-line bg-surface2'}`,
        null,
        () => alCambiar({ ...sel, [seg]: a.id }, seg),
      );
      b.append(
        el('span', 'flex justify-between gap-2 font-bold', el('span', '', a.nombre), el('span', 'num text-vio-hi', gr ? `${gr} g` : '—')),
        el('span', 'mt-0.5 flex justify-between gap-2 text-xs text-mut', el('span', '', nota), el('span', 'num shrink-0', kc ? `≈ ${Math.round(kc)} kcal` : '')),
      );
      return b;
    }),
  );

  const fig = el('div', 'mx-auto w-52');
  fig.append(svg);
  return el(
    'div',
    '',
    fig,
    leyenda,
    el('p', 'mt-4 flex items-baseline justify-between text-sm font-bold', `${segNombre} · ${P.pct[seg]} % del plato`, el('span', 'text-xs font-semibold text-mut', 'elige uno')),
    opciones,
  );
}

// ---------- Hoja ----------
function hoja(eyebrow: string, titulo: string): { dlg: HTMLDialogElement; cuerpo: HTMLElement } {
  const dlg = el(
    'dialog',
    'hoja mb-0 mt-auto max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] text-ink backdrop:bg-black/70',
  );
  const cerrar = boton('-m-2 p-2 text-2xl leading-none text-mut', '×', () => dlg.close());
  cerrar.setAttribute('aria-label', 'Cerrar');
  const cuerpo = el('div', 'mt-4');
  dlg.append(el('div', 'flex items-start justify-between gap-3', el('div', '', el('p', 'eyebrow', eyebrow), el('h2', 'mt-1 text-2xl font-extrabold', titulo)), cerrar), cuerpo);
  dlg.addEventListener('click', (ev) => {
    if (ev.target === dlg) dlg.close();
  });
  dlg.addEventListener('close', () => dlg.remove());
  document.body.append(dlg);
  dlg.showModal();
  // showModal enfoca la ✕ y le pinta el anillo de foco al abrir: sobra.
  (document.activeElement as HTMLElement | null)?.blur();
  return { dlg, cuerpo };
}

type Modo = 'opciones' | 'plato' | 'otra';

export async function abrirComida(fecha: string, bloqueId: BloqueId, alCambiar: () => void): Promise<void> {
  const bloque = BLOQUES.find((b) => b.id === bloqueId)!;
  const reg = (await getComidas())[fecha]?.[bloqueId];
  const { dlg, cuerpo } = hoja(`${fmtFecha(fecha)} · ≈ ${bloque.kcal} kcal · ${bloque.p} g prot`, bloque.nombre);
  let modo: Modo = reg?.tipo === 'plato' && bloque.plato ? 'plato' : reg?.tipo === 'otra' ? 'otra' : 'opciones';
  let sel: SelPlato = { ...PLATO_DEF, ...(reg?.tipo === 'plato' ? reg.sel : {}) };
  let seg: SegId = 'prot';
  let texto = reg?.tipo === 'otra' ? reg.texto : '';

  const marcar = async (valor: RegComida | null) => {
    await patchComidas(fecha, (d) => {
      if (valor) d[bloqueId] = valor;
      else delete d[bloqueId];
      return d;
    });
    dlg.close();
    alCambiar();
  };

  const pintar = () => {
    const modos: [Modo, string][] = [['opciones', 'Opciones'], ...(bloque.plato ? [['plato', 'Monta tu plato'] as [Modo, string]] : []), ['otra', 'Otra cosa']];
    const tabs = el(
      'div',
      `grid gap-1 rounded-xl bg-surface2 p-1 ${modos.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`,
      ...modos.map(([id, t]) =>
        boton(`rounded-lg py-2 text-sm font-bold ${modo === id ? 'bg-vio text-bg' : 'text-mut'}`, t, () => {
          modo = id;
          pintar();
        }),
      ),
    );

    let contenido: HTMLElement;
    if (modo === 'opciones') {
      const rueda = el(
        'div',
        'rueda -mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2',
        ...OPCIONES[bloqueId].map((o) => {
          const elegida = reg?.tipo === 'opcion' && reg.id === o.id;
          return el(
            'article',
            `flex w-[80%] shrink-0 snap-center flex-col rounded-xl border p-4 ${elegida ? 'border-vio bg-vio/10' : 'border-line bg-surface2'}`,
            el('h3', 'text-lg font-extrabold leading-tight', o.nombre),
            el(
              'ul',
              'mt-2 flex-1 space-y-1 text-sm',
              ...o.items.map(([q, t]) => el('li', 'flex gap-2', el('b', 'num w-16 shrink-0 text-vio-hi', q || '·'), el('span', 'text-mut', t))),
            ),
            el('p', 'num mt-3 flex justify-between text-xs font-semibold text-mut', el('span', '', `≈ ${miles(o.kcal)} kcal`), el('span', '', `${o.p} g prot`)),
            boton('btn mt-3 py-2.5 text-sm', 'Me he comido esto', () => void marcar({ tipo: 'opcion', id: o.id })),
          );
        }),
      );
      contenido = el(
        'div',
        '',
        rueda,
        el('p', 'mt-2 text-xs text-mut', 'Desliza para ver más. Si cambias un alimento por otro parecido, vale igual: pollo por pavo, arroz por pasta.'),
      );
      if (reg?.tipo === 'opcion') {
        const i = OPCIONES[bloqueId].findIndex((o) => o.id === reg.id);
        if (i > 0) requestAnimationFrame(() => (rueda.children[i] as HTMLElement).scrollIntoView({ inline: 'center', block: 'nearest' }));
      }
    } else if (modo === 'plato') {
      const tipo = bloqueId as 'comida' | 'cena';
      contenido = el(
        'div',
        'mt-4',
        platoEl(tipo, sel, seg, (s, g) => {
          sel = s;
          seg = g;
          pintar();
        }),
        boton('btn mt-4', 'Me he comido este plato', () => void marcar({ tipo: 'plato', sel })),
      );
    } else {
      const area = el('textarea', 'mt-1.5 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-sm');
      area.rows = 4;
      area.placeholder = 'Con cantidades, aunque sean a ojo: «2 huevos, 3 lonchas de bacon y un vaso de zumo de naranja».';
      area.value = texto;
      area.addEventListener('input', () => (texto = area.value));
      contenido = el(
        'div',
        'mt-4',
        el('label', 'text-sm font-bold', '¿Qué has comido?'),
        area,
        boton('btn mt-3', 'Guardar', () => {
          if (texto.trim()) void marcar({ tipo: 'otra', texto: texto.trim() });
          else area.focus();
        }),
        el('p', 'mt-2 text-xs text-mut', 'Sin culpa: salirse del plan también es un dato. Lo que importa es que quede apuntado.'),
      );
    }

    const pie = el(
      'div',
      'mt-4 flex flex-wrap justify-between gap-3 text-sm font-semibold',
      boton('text-vio-hi underline', 'Me la salté', () => void marcar({ tipo: 'salto' })),
      reg ? boton('text-mut underline', 'Quitar lo marcado', () => void marcar(null)) : null,
    );
    cuerpo.replaceChildren(tabs, contenido, pie);
  };
  pintar();
}

export function abrirSnack(fecha: string, alCambiar: () => void): void {
  const { dlg, cuerpo } = hoja(`${fmtFecha(fecha)} · libre · ≈ ${SNACK_DIA.kcal} kcal`, 'Snack');
  const anadir = async (x: Snack) => {
    await patchComidas(fecha, (d) => ({ ...d, snack: [...(d.snack ?? []), x] }));
    dlg.close();
    alCambiar();
  };
  const area = el('textarea', 'mt-1.5 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-sm');
  area.rows = 2;
  area.placeholder = '«Café con leche y un croissant», «unas patatas fritas»…';
  cuerpo.append(
    el(
      'div',
      'grid gap-2',
      ...SNACKS.map((s) => {
        const b = boton(
          'flex items-baseline justify-between gap-2 rounded-xl border border-line bg-surface2 px-3 py-2.5 text-left text-sm transition active:scale-[.98]',
          null,
          () => void anadir(s),
        );
        b.append(el('span', 'font-bold', s.t), el('span', 'num shrink-0 text-xs text-mut', `≈ ${s.kcal} kcal · ${s.p} g prot`));
        return b;
      }),
    ),
    el('label', 'mt-4 block text-sm font-bold', 'O escribe lo que sea'),
    area,
    boton('btn mt-3', 'Añadir', () => {
      const t = area.value.trim();
      if (t) void anadir({ t });
      else area.focus();
    }),
    el('p', 'mt-2 text-xs text-mut', 'Un toque y listo. Puedes apuntar varios en el mismo día.'),
  );
}

export async function quitarSnack(fecha: string, i: number): Promise<void> {
  await patchComidas(fecha, (d) => {
    const snack = (d.snack ?? []).filter((_, k) => k !== i);
    if (snack.length) return { ...d, snack };
    const { snack: _quitado, ...resto } = d;
    return resto;
  });
}
