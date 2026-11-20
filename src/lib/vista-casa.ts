// Pantalla Dieta de casa (Jose y Yasmina): Hoy, Semana, Compra y Carta. Cada
// uno ve por defecto lo suyo y puede mirar lo del otro, porque cocinan los dos.
// Lo apuntado (comidas hechas, fuera de lista y carro) va al móvil de cada uno.
import { getComidas, hoyISO, patchComidas } from './db';
import { boton, el } from './dom';
import { fmtFecha } from './plan-jeik';
import { perfil } from './perfiles';
import {
  CARTA,
  COMIDAS,
  DIAS_CICLO,
  PRODUCTOS,
  alMes,
  atajosDe,
  cantidad,
  consumo,
  costeSemana,
  diaCiclo,
  lunesDe,
  pedidos,
  planDia,
  reparto,
  semanaDe,
  sumarDias,
  type Comida,
  type Linea,
  type Persona,
  type Racion,
  type Semana,
} from './casa';
import type { DiaComidas, Snack } from './comidas';

type Pestana = 'hoy' | 'semana' | 'compra' | 'carta';

const miles = (n: number) => Math.round(n).toLocaleString('es-ES');
const eur = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const otra = (p: Persona): Persona => (p === 'jose' ? 'yasmina' : 'jose');
const nombre = (p: Persona) => CARTA.personas[p].nombre;
const sumar = (rs: Racion[]) => rs.reduce((a, r) => ({ kcal: a.kcal + r.kcal, prot: a.prot + r.prot, eur: a.eur + r.eur }), { kcal: 0, prot: 0, eur: 0 });
const LETRA: Record<Comida, string> = { desayuno: 'D', comida: 'C', merienda: 'M', cena: 'N' };

function seg<T extends string>(ops: [T, string][], actual: T, alElegir: (v: T) => void): HTMLElement {
  const g = el(
    'div',
    'grid gap-1 rounded-xl bg-surface2 p-1',
    ...ops.map(([v, t]) => {
      const b = boton(`rounded-lg px-1 py-2 text-xs font-bold ${v === actual ? 'bg-vio-hi text-bg' : 'text-mut'}`, t, () => alElegir(v));
      b.setAttribute('aria-pressed', String(v === actual));
      return b;
    }),
  );
  g.style.gridTemplateColumns = `repeat(${ops.length}, minmax(0, 1fr))`;
  return g;
}

function barra(valor: number, obj: number, cls: string, tope = true): HTMLElement {
  const b = el('div', 'mt-1.5 h-2 overflow-hidden rounded-full bg-surface2');
  const r = el('div', `h-full rounded-full ${tope && valor > obj * 1.05 ? 'bg-bad' : cls}`);
  r.style.width = `${Math.min(100, (valor / obj) * 100)}%`;
  b.append(r);
  return b;
}

// Grimorio (Yasmina): energía y proteína en anillos en vez de barras.
const VUELTA = 263.9;
function anillo(valor: number, obj: number, color: string, cifra: string, sub: string): HTMLElement {
  const frac = Math.min(1, obj ? valor / obj : 0);
  const a = el('div', 'gm-anillo');
  a.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="rgb(255 255 255 / .07)" stroke-width="7"/><circle cx="50" cy="50" r="42" fill="none" stroke="${color}" stroke-opacity="${frac ? 1 : 0}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${VUELTA}" stroke-dashoffset="${(VUELTA * (1 - frac)).toFixed(1)}"/></svg>`;
  a.append(el('div', 'gm-anillo-c', el('b', '', cifra), el('small', '', sub)));
  a.setAttribute('role', 'img');
  a.setAttribute('aria-label', `${cifra} ${sub}`);
  return a;
}
const CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function ingNombre(id: string): HTMLElement {
  const p = PRODUCTOS[id];
  return el('span', 'min-w-0', p.nombre, p.estado ? el('span', 'ml-1 text-xs text-mut', p.estado) : null);
}

// `gm`: la piel Grimorio de Yasmina (anillos, monedas, sin el cambio de persona
// arriba en Hoy). Jose la llama sin él y no cambia nada.
export async function dietaCasa(root: HTMLElement, yo: Persona, gm = false): Promise<void> {
  const hoy = hoyISO();
  const est = {
    tab: 'hoy' as Pestana,
    fecha: hoy,
    ver: yo,
    semana: semanaDe(diaCiclo(hoy)),
    pedido: semanaDe(diaCiclo(hoy)),
    abiertas: new Set<Comida>(['comida']),
    anadir: false,
  };
  const coste = costeSemana();
  const peds = pedidos();
  const cons = consumo();

  const pintar = async () => {
    const comidas = await getComidas();
    const tabs = seg<Pestana>(
      [
        ['hoy', 'Hoy'],
        ['semana', 'Semana'],
        ['compra', 'Compra'],
        ['carta', 'Carta'],
      ],
      est.tab,
      (t) => {
        est.tab = t;
        void pintar().then(() => window.scrollTo(0, 0));
      },
    );
    if (gm) tabs.classList.add('gm-seg');
    const vista = { hoy: vHoy, semana: vSemana, compra: vCompra, carta: vCarta }[est.tab](comidas);
    root.replaceChildren(tabs, el('div', 'mt-4 grid gap-4', ...vista));
  };

  const quien = () =>
    seg<Persona>(
      [yo, otra(yo)].map((p): [Persona, string] => [p, nombre(p)]),
      est.ver,
      (p) => {
        est.ver = p;
        void pintar();
      },
    );

  // ---------- Hoy ----------
  function vHoy(comidas: Record<string, DiaComidas>): HTMLElement[] {
    // Sin el cambio de persona arriba, Hoy siempre es lo suyo (si miró lo del
    // otro en Semana, al volver aquí no se queda atrapada en su plan).
    if (gm) est.ver = yo;
    const idx = diaCiclo(est.fecha);
    const sem = semanaDe(idx);
    const propio = est.ver === yo;
    const plan = planDia(est.ver, idx);
    const suyo = planDia(otra(est.ver), idx);
    const dia = propio ? comidas[est.fecha] : undefined;
    const extras = dia?.snack ?? [];
    const t = sumar(plan);
    // Lo propio suma lo marcado; del otro no hay marcas en este móvil y se ve su plan.
    const hechas = propio ? plan.filter((r) => dia?.hecho?.[r.comida]) : plan;
    const h = sumar(hechas);
    const kcal = h.kcal + extras.reduce((a, x) => a + (x.kcal ?? 0), 0);
    const prot = h.prot + extras.reduce((a, x) => a + (x.p ?? 0), 0);
    const obj = CARTA.personas[est.ver];

    const ir = (n: number) => {
      est.fecha = sumarDias(est.fecha, n);
      void pintar();
    };
    const nav = el(
      'div',
      'flex items-center justify-between rounded-xl border border-line bg-surface px-2 py-1.5',
      boton('h-10 w-10 text-2xl text-mut', '‹', () => ir(-1)),
      el(
        'div',
        'text-center',
        el('span', 'block text-sm font-bold', `${est.fecha === hoy ? 'Hoy, ' : ''}${fmtFecha(est.fecha)}`),
        el('span', 'eyebrow text-mut', `Semana ${sem} · ${PRODUCTOS[CARTA.fruta[sem].producto].nombre.toLowerCase()} · día ${idx + 1}/${DIAS_CICLO}`),
      ),
      boton('h-10 w-10 text-2xl text-mut', '›', () => ir(1)),
    );
    nav.firstElementChild!.setAttribute('aria-label', 'Día anterior');
    nav.lastElementChild!.setAttribute('aria-label', 'Día siguiente');
    if (gm) {
      nav.classList.add('gm-nav');
      const fruta = PRODUCTOS[CARTA.fruta[sem].producto].nombre.toLowerCase();
      nav.children[1].lastElementChild!.replaceWith(
        el('span', 'gm-nav-sub', el('em', '', `Semana ${sem}`), ` · día ${idx + 1} de ${DIAS_CICLO} · fruta: ${fruta}`),
      );
    }

    const nExtras = extras.length;
    const resumen = `Llevas ${hechas.length} de ${plan.length} comidas${nExtras ? ` y ${nExtras === 1 ? '1 extra' : `${nExtras} extras`}` : ''}. El plan del día suma ${miles(t.kcal)} kcal y ${Math.round(t.prot)} g.`;
    const totales = gm
      ? el(
          'section',
          'card',
          el(
            'div',
            'gm-anillos',
            anillo(kcal, obj.kcal, '#cfae66', miles(kcal), `de ${miles(obj.kcal)} kcal`),
            anillo(prot, obj.prot, '#ee9a5f', `${Math.round(prot)} g`, `de ${obj.prot} g prot.`),
          ),
          el('p', 'gm-anillos-p', resumen),
        )
      : el(
      'section',
      'card',
      el(
        'div',
        'grid grid-cols-2 gap-4',
        el('div', '', el('p', 'eyebrow', propio ? 'Energía' : 'Plan · energía'), el('p', 'num mt-1 text-lg font-extrabold', `${miles(kcal)} `, el('span', 'text-xs font-semibold text-mut', `/ ${miles(obj.kcal)} kcal`)), barra(kcal, obj.kcal, 'bg-vio')),
        el('div', '', el('p', 'eyebrow', propio ? 'Proteína' : 'Plan · proteína'), el('p', 'num mt-1 text-lg font-extrabold', `${Math.round(prot)} `, el('span', 'text-xs font-semibold text-mut', `/ ${obj.prot} g`)), barra(prot, obj.prot, 'bg-ok', false)),
      ),
      propio ? el('p', 'num mt-3 text-xs text-mut', resumen) : null,
    );

    const tarjetas = plan.map((r, i) => tarjeta(r, suyo[i], propio, !!dia?.hecho?.[r.comida]));
    const out = gm ? [nav, totales, ...tarjetas] : [quien(), nav, totales, ...tarjetas];
    if (propio) out.push(fueraDeLista(extras));
    else out.push(el('p', 'px-1 text-xs text-mut', `Lo que apunta ${nombre(est.ver)} se queda en su móvil. Aquí ves su plan y sus cantidades.`));
    if (est.ver === 'jose' && plan.some((r) => r.plato.curro)) out.push(el('p', 'px-1 text-xs text-mut', 'Lo del curro cuenta para las kcal del día y no entra en la compra.'));
    out.push(el('p', 'px-1 text-xs text-mut', `Lo que se cocina hoy para ${est.ver === yo ? 'ti' : nombre(est.ver)} cuesta `, el('span', 'num', eur(t.eur)), '.'));
    return out;
  }

  function tarjeta(r: Racion, suyo: Racion, propio: boolean, hecho: boolean): HTMLElement {
    const c = r.comida;
    const pl = r.plato;
    const mismo = pl.id === suyo.plato.id && !pl.curro;
    const abierta = est.abiertas.has(c);
    const hueco = CARTA.personas[est.ver].comidas[c];

    const cabeza = el('div', 'flex items-center gap-3');
    if (propio) {
      const tick = boton(
        `grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-sm font-extrabold ${hecho ? 'border-ok bg-ok/20 text-ok' : 'border-line text-mut'}`,
        hecho ? '✓' : '',
        () =>
          void patchComidas(est.fecha, (d) => {
            const h = { ...d.hecho };
            if (h[c]) delete h[c];
            else h[c] = true;
            const n: DiaComidas = { ...d, hecho: h };
            if (!Object.keys(h).length) delete n.hecho;
            return n;
          }).then(pintar),
      );
      tick.setAttribute('aria-label', `${hecho ? 'Desmarcar' : 'Marcar'} ${CARTA.comidas[c].toLowerCase()} como hecha`);
      if (gm) {
        tick.className = `gm-check${hecho ? ' gm-on' : ''}`;
        tick.innerHTML = hecho ? CHECK : '';
      }
      cabeza.append(tick);
    }
    const info = boton(
      'min-w-0 flex-1 text-left',
      gm
        ? el('span', 'gm-toma', CARTA.comidas[c])
        : el('span', 'eyebrow block text-mut', `${CARTA.comidas[c]} · ${Math.round(hueco[0])}/${hueco[1]}`),
      () => {
        if (abierta) est.abiertas.delete(c);
        else est.abiertas.add(c);
        void pintar();
      },
    );
    info.setAttribute('aria-expanded', String(abierta));
    info.append(
      el('span', 'block font-bold', pl.nombre),
      el('span', 'num block text-xs text-mut', `${miles(r.kcal)} kcal · ${Math.round(r.prot)} g${pl.curro ? '' : ` · ${eur(r.eur)}`}`),
    );
    cabeza.append(info);
    if (pl.curro) cabeza.append(el('span', 'shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] font-bold uppercase text-mut', 'Curro'));
    else if (mismo) cabeza.append(el('span', gm ? 'gm-chip' : 'shrink-0 rounded-full border border-vio px-2 py-0.5 text-[10px] font-bold uppercase text-vio-hi', 'Los dos'));
    cabeza.append(el('span', `shrink-0 text-mut transition ${abierta ? 'rotate-90' : ''}`, '›'));

    const card = el('section', 'card', cabeza);
    if (pl.curro) card.style.borderStyle = 'dashed';
    if (abierta) card.append(detalle(r, suyo, mismo));
    return card;
  }

  function detalle(r: Racion, suyo: Racion, mismo: boolean): HTMLElement {
    const box = el('div', 'mt-3 grid gap-3 border-t border-line pt-3');
    if (r.plato.curro) {
      box.append(el('p', 'text-xs text-mut', 'Lo pone el curro: cuenta para las kcal del día y no entra en la lista de la compra.'));
      return box;
    }
    const col = (activa: boolean) => `num text-right text-xs whitespace-nowrap ${activa ? 'font-bold text-ink' : 'text-mut'}`;
    const cab = (t: string, activa = false) => el('span', `eyebrow ${activa ? '' : 'text-mut'} text-right`, t);
    if (mismo) {
      const rj = est.ver === 'jose' ? r : suyo;
      const ry = est.ver === 'jose' ? suyo : r;
      const deY = new Map(ry.lineas.map((l) => [l.id, l]));
      const grid = el('div', 'grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4 gap-y-1.5 text-sm');
      grid.append(el('span', 'eyebrow text-mut', 'Para cocinar'), cab('Jose', est.ver === 'jose'), cab('Yasmina', est.ver === 'yasmina'));
      for (const l of rj.lineas) {
        const y = deY.get(l.id);
        grid.append(ingNombre(l.id), el('span', col(est.ver === 'jose'), cantidad(l)), el('span', col(est.ver === 'yasmina'), y ? cantidad(y) : '—'));
      }
      box.append(grid);
      if (r.plato.reparto) box.append(...repartoEl(rj, ry));
      else box.append(el('p', 'text-xs text-mut', 'Cada ración se prepara por separado con sus gramos.'));
    } else {
      const grid = el('div', 'grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 text-sm');
      grid.append(el('span', 'eyebrow text-mut', 'Ingredientes'), cab(nombre(est.ver), true));
      for (const l of r.lineas) grid.append(ingNombre(l.id), el('span', col(true), cantidad(l)));
      box.append(grid, el('p', 'text-xs text-mut', `${nombre(otra(est.ver))} toma otra cosa: `, el('b', 'text-ink', suyo.plato.curro ? 'en el curro' : suyo.plato.nombre), '.'));
    }
    return box;
  }

  function repartoEl(rj: Racion, ry: Racion): HTMLElement[] {
    const r10 = (n: number) => miles(Math.round(n / 10) * 10);
    const partes = reparto(rj.plato, rj, ry);
    const aparte = rj.lineas.some((l: Linea) => PRODUCTOS[l.id].aparte);
    return partes.map((pt, i) => {
      const split = el('div', 'flex h-2.5 gap-0.5 overflow-hidden rounded-full');
      const a = el('div', 'h-full bg-ink');
      const b = el('div', 'h-full bg-mut');
      a.style.width = `${pt.pctJose}%`;
      b.style.width = `${100 - pt.pctJose}%`;
      split.append(a, b);
      const persona = (p: Persona, pct: number, g: number, cls: string) =>
        el('div', cls, el('span', 'eyebrow block text-mut', nombre(p)), el('span', 'num text-xl font-extrabold', `${pct} %`), el('span', 'num ml-1 text-xs text-mut', `≈ ${r10(g)} g`));
      const ultimo = i === partes.length - 1;
      return el(
        'div',
        'grid gap-2 rounded-xl border border-vio-hi/60 p-3',
        el('div', 'flex items-baseline justify-between', el('span', 'eyebrow', pt.nombre), el('span', 'num text-xs text-mut', `≈ ${r10(pt.total)} g hecho`)),
        split,
        el('div', 'grid grid-cols-2 gap-2', persona('jose', pt.pctJose, pt.jose, ''), persona('yasmina', 100 - pt.pctJose, pt.yasmina, 'text-right')),
        ultimo
          ? el(
              'p',
              'text-xs text-mut',
              `${partes.length > 1 ? 'Pesa cada cosa hecha por separado' : 'Pesa la olla hecha'} y reparte por el porcentaje. Los gramos son orientativos: el agua y la merma cambian cada vez.${aparte ? ' El pan, la fruta y el cherry van aparte.' : ''}`,
            )
          : null,
      );
    });
  }

  function fueraDeLista(extras: Snack[]): HTMLElement {
    const poner = (x: Snack) => void patchComidas(est.fecha, (d) => ({ ...d, snack: [...(d.snack ?? []), x] })).then(pintar);
    const quitar = (i: number) =>
      void patchComidas(est.fecha, (d) => {
        const snack = (d.snack ?? []).filter((_, j) => j !== i);
        const n: DiaComidas = { ...d, snack };
        if (!snack.length) delete n.snack;
        return n;
      }).then(pintar);

    const card = el('section', 'card grid gap-3', el('div', 'flex items-baseline justify-between', el('h2', 'text-base font-bold', 'Fuera de lista'), el('span', 'text-xs text-mut', 'lo que no es del plan')));
    if (extras.length) {
      card.append(
        el(
          'ul',
          'divide-y divide-line',
          ...extras.map((x, i) => {
            const b = boton('-my-1 px-2 text-xl text-mut', '×', () => quitar(i));
            b.setAttribute('aria-label', `Quitar ${x.t}`);
            return el(
              'li',
              'flex items-center gap-2 py-2 text-sm',
              el('span', 'min-w-0 flex-1', x.t),
              el('span', 'num text-right text-xs text-mut', x.kcal != null ? `${miles(x.kcal)} kcal${x.p ? ` · ${x.p} g` : ''}` : 'sin kcal'),
              b,
            );
          }),
        ),
      );
    } else {
      card.append(el('p', 'text-xs text-mut', 'Nada apuntado. Aquí va lo que comas fuera de los platos: la barrita al salir del gym, una caña, algo fuera de casa.'));
    }
    const pesa = perfil(yo).alimentos;
    // Con Pesar la tarjeta crece mucho: en ese perfil lo de añadir va plegado tras un botón.
    const panel = pesa ? el('div', 'grid grid-cols-[minmax(0,1fr)] gap-3') : card;
    if (pesa) {
      const abrir = boton('rounded-lg border border-line bg-surface2 px-3 py-2 text-sm font-semibold', '', () => {
        est.anadir = !est.anadir;
        mostrar();
      });
      const mostrar = () => {
        panel.style.display = est.anadir ? '' : 'none';
        abrir.textContent = est.anadir ? 'Cerrar' : '+ Añadir';
        abrir.setAttribute('aria-expanded', String(est.anadir));
      };
      mostrar();
      card.append(abrir, panel);
    }
    panel.append(
      el(
        'div',
        'flex flex-wrap gap-2',
        ...atajosDe(yo).map((a) => boton('rounded-full border border-line bg-surface2 px-3 py-1.5 text-xs font-semibold', `+ ${a.t}${a.kcal ? ` · ${a.kcal}` : ''}`, () => poner({ ...a }))),
      ),
    );
    if (pesa) {
      const hueco = el('div');
      panel.append(hueco);
      void import('./vista-alimentos').then(({ pesarAlimentos }) => hueco.replaceWith(pesarAlimentos(poner)));
    }
    const campo = (id: string, ph: string, cls: string, num = false) => {
      const i = el('input', `${cls} min-w-0 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-mut`);
      i.id = id;
      i.placeholder = ph;
      i.setAttribute('aria-label', ph);
      if (num) i.inputMode = 'numeric';
      return i;
    };
    const txt = campo('extra-txt', 'Plato o ingrediente', 'col-span-4');
    const kc = campo('extra-kcal', 'kcal', 'num text-right', true);
    const pr = campo('extra-prot', 'prot', 'num text-right', true);
    const hc = campo('extra-hc', 'hc', 'num text-right', true);
    const gr = campo('extra-grasa', 'grasa', 'num text-right', true);
    const add = el('button', 'col-span-4 rounded-lg bg-vio-hi px-3 py-2 text-sm font-bold text-bg', 'Añadir');
    add.type = 'submit';
    const f = el('form', 'grid grid-cols-4 gap-2', txt, kc, pr, hc, gr, add);
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const t = txt.value.trim();
      if (!t) return txt.focus();
      const n = (i: HTMLInputElement) => parseInt(i.value, 10) || undefined;
      const x: Snack = { t };
      const k = n(kc);
      const p = n(pr);
      if (k) x.kcal = k;
      if (p) x.p = p;
      // Hidratos y grasa también con 0: «sin grasa» es un dato, no un hueco.
      const h = hc.value.trim() === '' ? undefined : parseInt(hc.value, 10);
      const g = gr.value.trim() === '' ? undefined : parseInt(gr.value, 10);
      if (Number.isFinite(h)) x.hc = h;
      if (Number.isFinite(g)) x.grasa = g;
      poner(x);
    });
    panel.append(f, el('p', 'text-xs text-mut', 'Solo el nombre es obligatorio. Proteína, hidratos y grasa en gramos. Con kcal suma al día; con hidratos y grasa sale también en las gráficas de macros.'));
    return card;
  }

  // ---------- Semana ----------
  function vSemana(_c: Record<string, DiaComidas>): HTMLElement[] {
    const hoyIdx = diaCiclo(hoy);
    const base = sumarDias(hoy, -hoyIdx);
    const lunes = lunesDe(hoy);
    const fechaDe = (idx: number) => {
      const f = sumarDias(base, idx);
      return f < lunes ? sumarDias(f, DIAS_CICLO) : f;
    };
    const desde = est.semana === 'A' ? 0 : 7;
    const dias = Array.from({ length: 7 }, (_, i) => desde + i);
    let K = 0;
    let P = 0;
    let E = 0;
    const tarjetas = dias.map((idx) => {
      const plan = planDia(est.ver, idx);
      const suyo = planDia(otra(est.ver), idx);
      const t = sumar(plan);
      K += t.kcal;
      P += t.prot;
      E += t.eur;
      const f = fechaDe(idx);
      const b = boton('card grid w-full grid-cols-[3.2rem_1fr] gap-3 text-left', null, () => {
        est.fecha = f;
        est.tab = 'hoy';
        void pintar().then(() => window.scrollTo(0, 0));
      });
      b.append(
        el('div', '', el('span', 'eyebrow block', fmtFecha(f).slice(0, 3)), el('span', 'num text-xs text-mut', f.slice(8) + '/' + f.slice(5, 7))),
        el(
          'div',
          'min-w-0',
          el(
            'div',
            'grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs',
            ...plan.map((r, i) =>
              el(
                'span',
                `truncate ${r.plato.curro ? 'italic text-mut' : ''}`,
                el('span', 'eyebrow mr-1 text-mut', LETRA[r.comida]),
                r.plato.corto,
                suyo[i].plato.id !== r.plato.id ? el('b', 'ml-1 text-vio-hi', '≠') : null,
              ),
            ),
          ),
          el('div', 'num mt-1.5 flex gap-3 text-[11px] text-mut', el('span', '', `${miles(t.kcal)} kcal`), el('span', '', `${Math.round(t.prot)} g`), el('span', '', eur(t.eur))),
        ),
      );
      if (idx === hoyIdx) b.style.borderColor = 'var(--color-vio)';
      return b;
    });
    const media = el(
      'section',
      'card grid grid-cols-2 gap-4',
      el('div', '', el('p', 'eyebrow', 'Media al día'), el('p', 'num mt-1 text-lg font-extrabold', `${miles(K / 7)} `, el('span', 'text-xs font-semibold text-mut', 'kcal')), el('p', 'num text-xs text-mut', `${Math.round(P / 7)} g de proteína`)),
      el('div', '', el('p', 'eyebrow', `Cocinar para ${nombre(est.ver)}`), el('p', 'num mt-1 text-lg font-extrabold', eur(E)), el('p', 'text-xs text-mut', 'esta semana')),
    );
    return [
      quien(),
      seg<Semana>(
        [
          ['A', `Semana A · ${PRODUCTOS[CARTA.fruta.A.producto].nombre.toLowerCase()}`],
          ['B', `Semana B · ${PRODUCTOS[CARTA.fruta.B.producto].nombre.toLowerCase()}`],
        ],
        est.semana,
        (s) => {
          est.semana = s;
          void pintar();
        },
      ),
      ...tarjetas,
      media,
      el('p', 'px-1 text-xs text-mut', el('b', 'text-vio-hi', '≠ '), `ese día ${nombre(otra(est.ver))} come otro plato. Toca un día para verlo entero.`),
    ];
  }

  // ---------- Compra ----------
  function vCompra(comidas: Record<string, DiaComidas>): HTMLElement[] {
    const lunes = lunesDe(hoy);
    const carro = new Set(comidas[lunes]?.compra ?? []);
    const casa = coste.jose + coste.yasmina;
    const tile = (t: string, sem: number) =>
      el('div', 'card', el('p', 'eyebrow', t), el('p', 'num mt-1 text-lg font-extrabold', eur(sem), el('span', 'text-xs font-semibold text-mut', ' /sem')), el('p', 'num text-xs text-mut', `${eur(alMes(sem))} al mes`));
    const tiles = el(
      'div',
      'grid grid-cols-2 gap-3',
      tile('Jose', coste.jose),
      tile('Yasmina', coste.yasmina),
      el(
        'div',
        'card col-span-2 flex items-end justify-between',
        el('div', '', el('p', 'eyebrow', 'Casa'), el('p', 'num mt-1 text-xl font-extrabold', eur(casa), el('span', 'text-xs font-semibold text-mut', ' /sem'))),
        el('p', 'num text-lg font-extrabold', eur(alMes(casa)), el('span', 'text-xs font-semibold text-mut', ' /mes')),
      ),
    );

    const items = peds[est.pedido];
    const total = items.reduce((a, x) => a + x.eur, 0);
    const clave = (id: string) => `${est.pedido}:${id}`;
    const enCarro = items.filter((x) => carro.has(clave(x.id))).reduce((a, x) => a + x.eur, 0);
    const marcar = (id: string) =>
      void patchComidas(lunes, (d) => {
        const s = new Set(d.compra ?? []);
        if (s.has(clave(id))) s.delete(clave(id));
        else s.add(clave(id));
        const n: DiaComidas = { ...d, compra: [...s] };
        if (!s.size) delete n.compra;
        return n;
      }).then(pintar);

    const lista = (fresco: boolean, titulo: string) => {
      const filas = items
        .filter((x) => !!PRODUCTOS[x.id].fresco === fresco)
        .map((x) => {
          const p = PRODUCTOS[x.id];
          const on = carro.has(clave(x.id));
          const usa = Math.round(Math.min(x.usa / x.n, 1) * 5);
          const b = boton('grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5 text-left', null, () => marcar(x.id));
          b.setAttribute('role', 'checkbox');
          b.setAttribute('aria-checked', String(on));
          b.append(
            el('span', `grid h-6 w-6 place-items-center rounded-md border-2 text-xs font-extrabold ${on ? 'border-ink bg-ink text-bg' : 'border-line'}`, on ? '✓' : ''),
            el(
              'span',
              'min-w-0',
              el('span', `block text-sm font-semibold ${on ? 'text-mut line-through' : ''}`, `${x.n} × ${p.nombre}`),
              el(
                'span',
                'flex items-center gap-1.5 text-xs text-mut',
                p.envase,
                el('span', 'flex gap-0.5', ...Array.from({ length: 5 }, (_, i) => el('i', `block h-1.5 w-1.5 rounded-full ${i < usa ? 'bg-mut' : 'bg-surface2'}`))),
              ),
            ),
            el('span', 'num text-right text-sm', eur(x.eur), x.n > 1 ? el('span', 'block text-[11px] text-mut', `${eur(p.precio)} ud`) : null),
          );
          return b;
        });
      return el('section', 'card', el('p', 'eyebrow', titulo), el('div', 'mt-1 divide-y divide-line', ...filas));
    };

    const FILAS = ['pollo', 'carne-picada', 'lomo-adobado', 'merluza', 'atun', 'huevo', 'natillas-prot', 'soja', 'lenteja', 'pan-molde'];
    const fmt = (id: string, g: number) => {
      if (id === 'soja') return `${(g / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 })} L`;
      if (id === 'lenteja') return `${(g / 400).toLocaleString('es-ES', { maximumFractionDigits: 1 })} tarros`;
      const u = PRODUCTOS[id].unidad;
      return u ? `${Math.round(g / u.g)} ${u.uds[1]}` : `${miles(g)} g`;
    };
    const sj = cons.persona.jose;
    const sy = cons.persona.yasmina;
    const td = (t: string, cls = '') => el('td', `num py-1.5 text-right text-xs ${cls}`, t);
    const tabla = el(
      'section',
      'card',
      el('p', 'eyebrow', 'Lo que come cada uno por semana'),
      el(
        'div',
        'mt-2 overflow-x-auto',
        el(
          'table',
          'w-full text-sm',
          el('thead', '', el('tr', 'text-[10px] uppercase text-mut', el('th', 'pb-1 text-left font-semibold', ''), el('th', 'pb-1 text-right font-semibold', 'Jose'), el('th', 'pb-1 text-right font-semibold', 'Yasmina'), el('th', 'pb-1 text-right font-semibold', 'Total'))),
          el(
            'tbody',
            'divide-y divide-line',
            ...FILAS.map((id) => {
              const j = (sj[id] ?? 0) / 2;
              const y = (sy[id] ?? 0) / 2;
              return el('tr', '', el('td', 'py-1.5 pr-2 text-sm', PRODUCTOS[id].nombre), td(fmt(id, j), 'text-mut'), td(fmt(id, y), 'text-mut'), td(fmt(id, j + y), 'font-bold'));
            }),
          ),
        ),
      ),
    );

    return [
      tiles,
      el('p', 'px-1 text-xs text-mut', 'Es lo que os coméis. El pedido sale algo más porque la despensa se compra en envases enteros y lo que sobra tira para la semana siguiente.'),
      seg<Semana>(
        [
          ['A', `Pedido A · ${PRODUCTOS[CARTA.fruta.A.producto].nombre.toLowerCase()}`],
          ['B', `Pedido B · ${PRODUCTOS[CARTA.fruta.B.producto].nombre.toLowerCase()}`],
        ],
        est.pedido,
        (s) => {
          est.pedido = s;
          void pintar();
        },
      ),
      el(
        'div',
        'flex items-baseline justify-between px-1',
        el('h2', 'text-base font-bold', `Pedido ${est.pedido}`, semanaDe(diaCiclo(hoy)) === est.pedido ? el('span', 'ml-2 text-xs font-semibold text-mut', 'el de esta semana') : null),
        el('span', 'num text-lg font-extrabold', eur(total)),
      ),
      el('p', 'num -mt-2 px-1 text-xs text-mut', `En el carro ${eur(enCarro)} · faltan ${eur(total - enCarro)}`),
      lista(true, 'Frescos · cada semana'),
      lista(false, 'Despensa · esta vez toca'),
      el('p', 'px-1 text-xs text-mut', 'Los puntos dicen cuánto del envase se gasta esa semana; lo demás queda en casa. El primer pedido lleva toda la despensa de golpe y sale más caro. El carro se vacía solo cada lunes.'),
      tabla,
    ];
  }

  // ---------- Carta ----------
  function vCarta(_c: Record<string, DiaComidas>): HTMLElement[] {
    const primera = (p: Persona, id: string) => {
      for (let d = 0; d < DIAS_CICLO; d++) {
        const r = planDia(p, d).find((x) => x.plato.id === id);
        if (r) return r;
      }
      return null;
    };
    const k = (r: Racion | null) => (r ? `${miles(r.kcal)} · ${Math.round(r.prot)} g` : '—');
    const obj = (p: Persona) => {
      const d = CARTA.personas[p];
      return el('div', '', el('p', 'num text-lg font-extrabold', `${miles(d.kcal)} `, el('span', 'text-xs font-semibold text-mut', 'kcal')), el('p', 'text-xs text-mut', `${d.nombre} · ${d.prot} g prot · ${d.nota}`));
    };
    const evita = CARTA.personas.yasmina.evita ?? [];
    const out: HTMLElement[] = [
      el(
        'section',
        'card',
        el('p', 'eyebrow', 'Objetivos'),
        el('div', 'mt-2 grid grid-cols-2 gap-4', obj('jose'), obj('yasmina')),
        el('p', 'mt-3 text-xs text-mut', `${evita.length ? `Yasmina no come ${evita.join(' ni ')}. ` : ''}Como mucho una natilla al día cada uno.`),
      ),
    ];
    for (const c of COMIDAS) {
      const platos = CARTA.platos.filter((p) => p.comida === c);
      out.push(
        el(
          'section',
          'card',
          el('div', 'flex items-baseline justify-between', el('p', 'eyebrow', CARTA.comidas[c]), el('span', 'text-[11px] text-mut', 'Jose · Yasmina')),
          el(
            'div',
            'mt-1 divide-y divide-line',
            ...platos.map((p) => {
              const j = primera('jose', p.id);
              const y = primera('yasmina', p.id);
              return el(
                'div',
                'grid grid-cols-[1fr_auto] gap-3 py-2',
                el('span', 'text-sm font-semibold', p.nombre, p.curro ? el('span', 'ml-2 rounded-full border border-line px-1.5 py-0.5 text-[10px] uppercase text-mut', 'Curro') : null),
                el('span', 'num text-right text-xs', el('span', 'block', k(j)), el('span', 'block text-mut', k(y))),
              );
            }),
          ),
        ),
      );
    }
    out.push(el('p', 'px-1 text-xs text-mut', 'La ración de Yasmina sale del mismo plato: casi la misma proteína y menos arroz, pan y aceite. En las ollas para los dos baja todo en la misma proporción.'));
    return out;
  }

  await pintar();
}
