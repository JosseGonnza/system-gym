import type { Descarga } from './descarga';
import { boton, el } from './dom';
import { sumarDias } from './plan-jeik';

// Tras aceptarla, tres semanas sin avisar: la propia descarga baja las marcas.
const SILENCIO = 21;
const n1 = (x: number) => x.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pct = (x: number) => `${Math.round(x * 100)} %`;

const clave = (perfil: string) => `descarga-callada:${perfil}`;
function callada(perfil: string, hoy: string): boolean {
  try {
    const hasta = localStorage.getItem(clave(perfil));
    return hasta != null && hoy <= hasta;
  } catch {
    return false;
  }
}

export function avisoDescarga(root: HTMLElement, d: Descarga, perfil: string, hoy: string): void {
  if (!d.toca || callada(perfil, hoy)) return;
  const lineas: string[] = [];
  if (d.senales.includes('cansancio')) {
    if (d.energia && d.baja.energia) lineas.push(`Energía: ${n1(d.energia[0])} de media en dos semanas (lo normal, ${n1(d.energia[1])}).`);
    if (d.sueno && d.baja.sueno) lineas.push(`Sueño: ${n1(d.sueno[0])} h (lo normal, ${n1(d.sueno[1])} h).`);
  }
  if (d.senales.includes('estancado')) {
    const nombres = d.estancados.slice(0, 4).join(', ');
    lineas.push(`Sin mejorar en las 3 últimas sesiones: ${nombres}${d.estancados.length > 4 ? ` y ${d.estancados.length - 4} más` : ''}.`);
  }
  if (d.senales.includes('fallos') && d.fallos) lineas.push(`Series al fallo o cortas: ${pct(d.fallos[0])} (lo normal, ${pct(d.fallos[1])}).`);

  root.replaceChildren(
    el('p', 'eyebrow text-warn', 'Aviso de descarga'),
    el('h3', 'mt-1 text-lg font-extrabold', 'Toca una semana suave'),
    el('ul', 'mt-2 list-disc space-y-1 pl-5 text-sm text-mut', ...lineas.map((t) => el('li', '', t))),
    el(
      'p',
      'mt-3 text-sm',
      'Esta semana, una serie menos por ejercicio, o las mismas series con un 10 % menos de peso, y sin llegar al fallo. La siguiente vuelves a lo de siempre.',
    ),
    boton('btn-2 mt-3 w-full py-2.5 text-sm', 'Hecho, esta semana la hago suave', () => {
      try {
        localStorage.setItem(clave(perfil), sumarDias(hoy, SILENCIO));
      } catch {
        /* sin almacenamiento, el aviso vuelve a salir */
      }
      root.classList.add('hidden');
    }),
  );
  // .card pisa los colores de borde de Tailwind (#24).
  root.style.borderColor = 'color-mix(in srgb, var(--color-warn) 45%, transparent)';
  root.classList.remove('hidden');
}
