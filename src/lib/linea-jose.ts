import { partirGlifos, svgLinea } from './iconos-linea';

// Los emojis sueltos (▶ Empezar, 🗑 Descartar, ⚠️ de los tips…) se cambian por su
// icono de línea al pintarse, también los que las páginas escriben después.
const FUERA = 'script, style, textarea, .ico, .tab-ico';

function vestir(n: Text): void {
  const p = n.parentElement;
  if (!p || p.closest(FUERA)) return;
  const trozos = partirGlifos(n.data);
  if (!trozos) return;
  const frag = document.createDocumentFragment();
  for (const t of trozos) {
    if (typeof t === 'string') frag.append(t);
    else {
      const s = document.createElement('span');
      s.className = trozos.length === 1 ? 'glifo-linea glifo-solo' : 'glifo-linea';
      s.innerHTML = svgLinea(t.icono, 18);
      frag.append(s);
    }
  }
  n.replaceWith(frag);
}

function recorrer(raiz: Node): void {
  if (raiz.nodeType === Node.TEXT_NODE) return vestir(raiz as Text);
  if (!(raiz instanceof Element)) return;
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  const nodos: Text[] = [];
  while (w.nextNode()) nodos.push(w.currentNode as Text);
  nodos.forEach(vestir);
  for (const el of [raiz, ...raiz.querySelectorAll('[placeholder]')]) {
    const ph = el.getAttribute('placeholder');
    const t = ph && partirGlifos(ph);
    if (t) el.setAttribute('placeholder', t.filter((x) => typeof x === 'string').join(' '));
  }
}

export function arrancarLinea(): void {
  recorrer(document.body);
  new MutationObserver((cambios) => {
    for (const c of cambios) {
      if (c.type === 'characterData') vestir(c.target as Text);
      else c.addedNodes.forEach(recorrer);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}
