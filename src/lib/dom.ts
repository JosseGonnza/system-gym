// Dos atajos para montar DOM a mano sin repetir createElement en cada línea.
type Hijo = Node | string | null | undefined | false;

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, clase = '', ...hijos: Hijo[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (clase) e.className = clase;
  for (const h of hijos) if (h) e.append(h);
  return e;
}

export function boton(clase: string, texto: Hijo, alPulsar: () => void): HTMLButtonElement {
  const b = el('button', clase, texto);
  b.type = 'button';
  b.addEventListener('click', alPulsar);
  return b;
}
