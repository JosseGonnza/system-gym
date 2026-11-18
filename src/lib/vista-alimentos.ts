// Bloque «Pesar» de Fuera de lista (#42, solo Jose): buscar, poner gramos,
// sumar y apuntarlo como una línea del día. También alta y edición de alimentos.
import { aSnack, buscar, macrosDe, nuevoAlimento, todos, type Alimento, type CamposAlimento } from './alimentos';
import type { Pesada, Snack } from './comidas';
import { getAlimentos, setAlimentos } from './db';
import { boton, el } from './dom';

// Fuera de la función: la pantalla se repinta entera al marcar una comida y lo
// que estabas pesando no debe perderse por eso.
const est = { pesadas: [] as Pesada[], nombre: '', q: '' };

const miles = (n: number) => Math.round(n).toLocaleString('es-ES');
const leerG = (s: string) => {
  const n = Number(s.trim().replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : 0;
};
const resumen = (k: number, p: number) => `${miles(k)} kcal · ${Math.round(p)} g`;

export function pesarAlimentos(anadir: (s: Snack) => void): HTMLElement {
  // contain: el ancho lo pone la tarjeta; un nombre largo se recorta en vez de
  // ensanchar la rejilla de toda la pantalla.
  const caja = el('div', 'grid gap-3 rounded-xl border border-line bg-surface2/40 p-3');
  caja.style.contain = 'inline-size';
  caja.style.gridTemplateColumns = 'minmax(0, 1fr)';
  let propios: Alimento[] = [];
  let lista = todos();

  const buscador = el('input', 'w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-mut');
  buscador.type = 'search';
  buscador.placeholder = 'Busca: pollo, plátano, leche…';
  buscador.setAttribute('aria-label', 'Buscar alimento');
  buscador.autocomplete = 'off';
  buscador.value = est.q;
  const resultados = el('ul', 'grid grid-cols-[minmax(0,1fr)] gap-1.5');
  const pesadas = el('div', 'grid grid-cols-[minmax(0,1fr)] gap-2');
  const ficha = el('div', 'hidden');

  const pintarResultados = () => {
    const rs = buscar(lista, est.q, 6);
    resultados.replaceChildren(
      ...rs.map((a) => {
        const elegir = boton('flex min-w-0 flex-1 items-baseline gap-2 py-1.5 text-left text-sm', null, () => {
          est.pesadas.push({ id: a.id, g: 0 });
          est.q = '';
          buscador.value = '';
          pintarResultados();
          pintarPesadas(true);
        });
        const partes = [
          el('span', 'min-w-0 truncate font-semibold', a.nombre),
          a.estado ? el('span', 'shrink-0 text-xs text-mut', a.estado) : null,
          a.revisar ? el('span', 'shrink-0 text-xs text-warn', '≈') : null,
          el('span', 'num ml-auto shrink-0 text-xs text-mut', `${miles(a.por100.kcal)} kcal/100 g`),
        ];
        elegir.append(...partes.filter((x): x is HTMLSpanElement => x != null));
        const editar = boton('-my-1 px-2 text-base text-mut', '✎', () => abrirFicha(a));
        editar.setAttribute('aria-label', `Editar ${a.nombre}`);
        return el('li', 'flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5', elegir, editar);
      }),
    );
    if (est.q.trim() && !rs.length) resultados.append(el('li', 'text-xs text-mut', 'No está en la lista. Créalo con «+ Nuevo».'));
    resultados.style.display = resultados.children.length ? '' : 'none';
  };

  const pintarPesadas = (enfocarUltima = false) => {
    const porId = new Map(lista.map((a) => [a.id, a]));
    est.pesadas = est.pesadas.filter((p) => porId.has(p.id));
    pesadas.style.display = est.pesadas.length ? '' : 'none';
    if (!est.pesadas.length) {
      pesadas.replaceChildren();
      return;
    }
    const filas = est.pesadas.map((p, i) => {
      const a = porId.get(p.id)!;
      const m = macrosDe(a, p.g, p.hecho);
      const cifra = el('span', 'num shrink-0 whitespace-nowrap text-xs text-mut', p.g ? resumen(m.kcal, m.prot) : '—');
      const g = el('input', 'num w-16 rounded-lg border border-line bg-bg px-2 py-1.5 text-right text-sm text-ink');
      g.inputMode = 'decimal';
      g.value = p.g ? String(p.g).replace('.', ',') : '';
      g.placeholder = '0';
      g.setAttribute('aria-label', `Gramos de ${a.nombre}`);
      g.addEventListener('input', () => {
        p.g = leerG(g.value);
        const mm = macrosDe(a, p.g, p.hecho);
        cifra.textContent = p.g ? resumen(mm.kcal, mm.prot) : '—';
        pintarTotal();
      });
      const quitar = boton('-my-1 px-1.5 text-xl text-mut', '×', () => {
        est.pesadas.splice(i, 1);
        pintarPesadas();
      });
      quitar.setAttribute('aria-label', `Quitar ${a.nombre}`);
      const fila = el(
        'div',
        'flex flex-col gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-2',
        el('div', 'flex items-center gap-2', el('span', 'min-w-0 flex-1 truncate text-sm font-semibold', a.nombre), cifra, quitar),
        el('div', 'flex items-center gap-2', g, el('span', 'text-xs text-mut', 'g'), forma(a, p)),
      );
      if (enfocarUltima && i === est.pesadas.length - 1) queueMicrotask(() => g.focus());
      return fila;
    });
    const total = el('div', 'num flex flex-wrap items-baseline justify-between gap-x-3');
    total.id = 'pesar-total';
    const nombre = el('input', 'min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-mut');
    nombre.placeholder = 'Nombre (opcional): «Batido»';
    nombre.setAttribute('aria-label', 'Nombre de lo que has pesado');
    nombre.value = est.nombre;
    nombre.addEventListener('input', () => (est.nombre = nombre.value));
    const ok = el('button', 'rounded-lg bg-vio-hi px-3 text-sm font-bold text-bg', 'Añadir al día');
    ok.type = 'button';
    ok.addEventListener('click', () => {
      const s = aSnack(est.pesadas, lista, est.nombre);
      if (!s.items?.length) {
        pesadas.querySelector<HTMLInputElement>('input[inputmode=decimal]')?.focus();
        return;
      }
      est.pesadas = [];
      est.nombre = '';
      anadir(s);
    });
    pesadas.replaceChildren(...filas, total, el('div', 'flex gap-2', nombre, ok));
    pintarTotal();
  };

  // Crudo o hecho, solo si el alimento cambia de peso al cocinarse.
  const forma = (a: Alimento, p: Pesada): HTMLElement | null => {
    if (!a.cocido) return null;
    const g = el('div', 'ml-auto flex gap-1 rounded-lg bg-surface2 p-0.5');
    const op = (hecho: boolean, t: string) => {
      const b = boton(`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-bold ${!!p.hecho === hecho ? 'bg-vio-hi text-bg' : 'text-mut'}`, t, () => {
        if (hecho) p.hecho = true;
        else delete p.hecho;
        pintarPesadas();
      });
      b.setAttribute('aria-pressed', String(!!p.hecho === hecho));
      return b;
    };
    g.append(op(false, a.estado?.split(',')[0] ?? 'en crudo'), op(true, 'hecho'));
    return g;
  };

  const pintarTotal = () => {
    const t = pesadas.querySelector('#pesar-total');
    if (!t) return;
    const s = aSnack(est.pesadas, lista);
    t.replaceChildren(
      ...(s.items?.length
        ? [el('span', 'text-sm font-bold', `${miles(s.kcal ?? 0)} kcal · ${s.p} g prot`), el('span', 'text-xs text-mut', `${s.hc} g hc · ${s.grasa} g grasa`)]
        : [el('span', 'text-xs text-mut', 'Pon los gramos.')]),
    );
  };

  const abrirFicha = (base?: Alimento) => {
    const campo = (ph: string, v: string, num = true) => {
      const i = el('input', `min-w-0 rounded-lg border border-line bg-bg px-2.5 py-2 text-sm text-ink placeholder:text-mut ${num ? 'num text-right' : 'col-span-4'}`);
      i.placeholder = ph;
      i.setAttribute('aria-label', ph);
      i.value = v;
      if (num) i.inputMode = 'decimal';
      return i;
    };
    const fmt = (n: number) => String(n).replace('.', ',');
    const f: Record<keyof CamposAlimento, HTMLInputElement> = {
      nombre: campo('Nombre', base?.nombre ?? '', false),
      kcal: campo('kcal', base ? fmt(base.por100.kcal) : ''),
      prot: campo('prot', base ? fmt(base.por100.prot) : ''),
      hc: campo('hc', base ? fmt(base.por100.hc) : ''),
      grasa: campo('grasa', base ? fmt(base.por100.grasa) : ''),
    };
    const error = el('p', 'text-xs text-bad');
    const guardar = el('button', 'rounded-lg bg-vio-hi px-3 py-2 text-sm font-bold text-bg', 'Guardar');
    guardar.type = 'submit';
    const cerrar = () => {
      ficha.className = 'hidden';
      ficha.replaceChildren();
    };
    const form = el(
      'form',
      'grid gap-2 rounded-lg border border-vio-hi/50 bg-surface p-3',
      el('p', 'eyebrow', base ? `Editar · ${base.nombre}` : 'Nuevo alimento'),
      el('div', 'grid grid-cols-4 gap-2', f.nombre, f.kcal, f.prot, f.hc, f.grasa),
      el('p', 'text-xs text-mut', base?.revisar ? 'Valor aproximado: cámbialo por el de la etiqueta. Todo por 100 g.' : 'Copia la tabla de la etiqueta: todo por 100 g.'),
      error,
      el(
        'div',
        'flex items-center gap-2',
        guardar,
        boton('px-2 text-sm text-mut', 'Cancelar', cerrar),
        base?.propio
          ? boton('ml-auto px-2 text-sm text-bad', 'Borrar', () => {
              void guardarPropios(propios.filter((a) => a.id !== base.id)).then(cerrar);
            })
          : null,
      ),
    );
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const r = nuevoAlimento(
        { nombre: f.nombre.value, kcal: f.kcal.value, prot: f.prot.value, hc: f.hc.value, grasa: f.grasa.value },
        lista,
        base,
      );
      if (!r.ok) {
        error.textContent = r.error;
        return;
      }
      const nuevo = r.alimento;
      void guardarPropios([...propios.filter((a) => a.id !== nuevo.id), nuevo]).then(() => {
        cerrar();
        if (!base) {
          est.pesadas.push({ id: nuevo.id, g: 0 });
          pintarPesadas(true);
        }
      });
    });
    ficha.className = '';
    ficha.replaceChildren(form);
    f.nombre.focus();
  };

  const guardarPropios = async (a: Alimento[]) => {
    propios = a;
    await setAlimentos(a);
    lista = todos(propios);
    pintarResultados();
    pintarPesadas();
  };

  buscador.addEventListener('input', () => {
    est.q = buscador.value;
    pintarResultados();
  });

  caja.append(
    el(
      'div',
      'flex items-baseline justify-between',
      el('span', 'eyebrow', 'Pesar'),
      boton('text-xs font-semibold text-vio-hi', '+ Nuevo', () => abrirFicha()),
    ),
    buscador,
    resultados,
    ficha,
    pesadas,
  );

  void getAlimentos().then((a) => {
    propios = a;
    lista = todos(propios);
    pintarResultados();
    pintarPesadas();
  });
  return caja;
}
