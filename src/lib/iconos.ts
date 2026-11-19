import { hayLinea, svgLinea } from './iconos-linea';
import { hayTrazo, svgTrazo } from './iconos-trazo';

// Símbolo del día. Si la rutina guardada no trae `icono` (rutinas anteriores al
// 05/08), se deduce por su posición en la rueda: así nunca cae al emoji.
const SIMBOLOS_DIA = ['dia-empuje', 'dia-hombro', 'dia-pierna', 'dia-bombeo', 'dia-espalda'];

export function iconoDeDia(dias: { id: string }[], dia: { id: string; icono?: string }): string {
  if (dia.icono) return dia.icono;
  const i = dias.findIndex((d) => d.id === dia.id);
  return SIMBOLOS_DIA[(i < 0 ? 0 : i) % SIMBOLOS_DIA.length];
}

// Devuelve un <span> con las variantes que puede haber: línea fina (Jose),
// trazo (Yasmina, Grimorio) y emoji de reserva. El CSS decide cuál se ve.
export function iconoEl(id: string | undefined, emoji: string, px = 22): HTMLElement {
  const span = document.createElement('span');
  span.className = 'ico';
  if (hayTrazo(id)) {
    span.classList.add('has-trazo');
    const t = document.createElement('span');
    t.className = 'ico-trazo-wrap';
    t.innerHTML = svgTrazo(id!, px);
    span.appendChild(t);
  }
  if (hayLinea(id)) {
    span.classList.add('has-linea');
    const linea = document.createElement('span');
    linea.className = 'ico-linea-wrap';
    linea.innerHTML = svgLinea(id!, px);
    span.appendChild(linea);
  }
  const em = document.createElement('span');
  em.className = 'ico-emoji';
  em.textContent = emoji;
  span.appendChild(em);
  return span;
}
