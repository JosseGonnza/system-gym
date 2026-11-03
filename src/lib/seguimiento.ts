// Domingo de seguimiento: lo que Jeik contesta, el resumen de la semana y el
// correo que le llega a Jose. Las fotos no viajan: se hacen con la cámara y se
// quedan en su galería; aquí solo se marca que están hechas.
import { BLOQUES, resumenComidas, type DiaComidas } from './comidas';
import { BLOQUE, CARDIO_SEMANA, INICIO, lunesDe, metaGym, semanaDe, semanaN, sumarDias } from './plan-jeik';
import type { Mediciones, Rutina, Sesion } from './types';

export type FotoId = 'frente' | 'perfil' | 'espalda';
export const FOTOS: { id: FotoId; nombre: string }[] = [
  { id: 'frente', nombre: 'De frente' },
  { id: 'perfil', nombre: 'De perfil' },
  { id: 'espalda', nombre: 'De espaldas' },
];

export interface Domingo {
  hambre?: number;
  sueno?: number;
  energia?: number;
  salidas?: 0 | 1 | 2;
  nota?: string;
  fotos?: FotoId[];
  cerrado?: boolean;
}

export const SALIDAS = ['Ninguna', 'Una', 'Dos o más'] as const;
const SENSACION = { facil: 'subir', bien: 'igual', duro: 'bajar' } as const;

export const primerDomingo = (): string => sumarDias(INICIO, 6);

// El domingo que toca cerrar. El lunes y el martes todavía se puede cerrar la
// semana anterior si quedó pendiente; antes del primer domingo, el primero.
export function domingoACerrar(hoy: string, domingos: Record<string, Domingo>): string {
  const lunes = lunesDe(hoy);
  const anterior = sumarDias(lunes, -1);
  const diaSemana = Math.round((Date.parse(`${hoy}T12:00:00`) - Date.parse(`${lunes}T12:00:00`)) / 86_400_000);
  if (diaSemana <= 1 && anterior >= primerDomingo() && !domingos[anterior]?.cerrado) return anterior;
  const este = sumarDias(lunes, 6);
  return este < primerDomingo() ? primerDomingo() : este;
}

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const diaCorto = (f: string) => `${DIAS_CORTOS[new Date(`${f}T12:00:00`).getDay()]} ${Number(f.slice(8))}`;
const dec = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export interface ResumenSemana {
  fechas: string[];
  gym: Sesion[];
  cardio: Sesion[];
  pesos: number[];
  media: number | null;
  cintura: number | null;
  comidas: ReturnType<typeof resumenComidas>;
}

export function resumenSemana(
  domingo: string,
  sesiones: Sesion[],
  rutina: Rutina,
  mediciones: Mediciones,
  comidas: Record<string, DiaComidas>,
): ResumenSemana {
  const fechas = semanaDe(domingo);
  const fin = sesiones
    .filter((s) => s.estado === 'finalizada' && fechas.includes(s.fecha))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const suelto = (s: Sesion) => !!rutina.dias.find((d) => d.id === s.diaId)?.fueraDeRueda;
  const pesos = mediciones.peso
    .filter((p) => fechas.includes(p.fecha))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((p) => p.kg);
  const cinturas = mediciones.cintura.filter((c) => fechas.includes(c.fecha)).sort((a, b) => a.fecha.localeCompare(b.fecha));
  return {
    fechas,
    gym: fin.filter((s) => !suelto(s)),
    cardio: fin.filter(suelto),
    pesos,
    media: pesos.length ? pesos.reduce((n, p) => n + p, 0) / pesos.length : null,
    cintura: cinturas.at(-1)?.cm ?? null,
    comidas: resumenComidas(comidas, fechas),
  };
}

const diasDistintos = (xs: Sesion[]) => new Set(xs.map((s) => s.fecha)).size;

function lineasGym(s: Sesion, rutina: Rutina): string[] {
  const dia = rutina.dias.find((d) => d.id === s.diaId);
  const out = [`- ${diaCorto(s.fecha)}: ${dia?.nombre ?? s.diaId}`];
  for (const e of s.ejercicios) {
    const hechas = e.series.filter((x) => x.estado !== 'pendiente');
    if (!hechas.length) continue;
    const def = dia?.ejercicios.find((x) => x.ranuraId === e.ranuraId);
    let que: string;
    if (def?.tipoProgresion === 'tiempo') {
      que = hechas.map((x) => `${x.segundos ?? '?'} s`).join(', ');
    } else {
      const pesos = [...new Set(hechas.map((x) => x.peso).filter((p): p is number => p != null))];
      const reps = hechas.every((x) => x.reps != null) ? ` · ${hechas.map((x) => x.reps).join(', ')} reps` : '';
      que = `${pesos.length ? `${pesos.map((p) => p.toLocaleString('es-ES')).join('/')} kg · ` : ''}${hechas.length} series${reps}`;
    }
    const marcas = `${e.sensacion ? ` (${SENSACION[e.sensacion]})` : ''}${e.molestia ? ' (MOLESTIA)' : ''}`;
    out.push(`   ${e.nombre}: ${que}${marcas}`);
  }
  if (s.notas.trim()) out.push(`   Nota: ${s.notas.trim()}`);
  return out;
}

function lineaCardio(s: Sesion): string {
  const usada = s.ejercicios.find((e) => e.series.some((x) => x.estado !== 'pendiente' || (x.segundos ?? 0) > 0)) ?? s.ejercicios[0];
  const seg = usada?.series[0]?.segundos;
  return `- ${diaCorto(s.fecha)}: cardio, ${usada?.nombre.toLowerCase() ?? 'sin máquina'}${seg ? `, ${Math.round(seg / 60)} min` : ''}`;
}

export function asunto(domingo: string): string {
  return `Seguimiento semana ${semanaN(domingo)}`;
}

export function textoSeguimiento(
  domingo: string,
  d: Domingo,
  r: ResumenSemana,
  rutina: Rutina,
  comidas: Record<string, DiaComidas>,
): string {
  const [lunes] = r.fechas;
  const L = [`Semana ${semanaN(domingo)} · bloque ${BLOQUE} · del ${diaCorto(lunes)} al ${diaCorto(domingo)}`, ''];

  L.push('ENTRENO', `Gimnasio ${diasDistintos(r.gym)}/${metaGym(domingo)} · Cardio ${diasDistintos(r.cardio)}/${CARDIO_SEMANA}`);
  for (const s of [...r.gym, ...r.cardio].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    L.push(...(r.cardio.includes(s) ? [lineaCardio(s)] : lineasGym(s, rutina)));
  }

  L.push('', 'PESO Y CINTURA');
  L.push(r.media != null ? `Peso medio ${dec(r.media)} kg (${r.pesos.map(dec).join(' · ')})` : 'Sin pesajes esta semana');
  L.push(`Cintura ${r.cintura != null ? `${dec(r.cintura)} cm` : 'sin medir'}`);
  L.push(`Fotos: ${d.fotos?.length ?? 0} de 3 hechas`);

  L.push('', 'COMIDAS', `Del plan ${r.comidas.plan} · Otra cosa ${r.comidas.otra} · Saltadas ${r.comidas.salto}`);
  for (const f of r.fechas) {
    for (const b of BLOQUES) {
      const reg = comidas[f]?.[b.id];
      if (reg?.tipo === 'otra') L.push(`- ${diaCorto(f)}, ${b.nombre.toLowerCase()}: ${reg.texto}`);
    }
  }
  const conSnack = r.fechas.filter((f) => comidas[f]?.snack?.length);
  L.push(conSnack.length ? 'Snacks:' : 'Snacks: ninguno');
  for (const f of conSnack) L.push(`- ${diaCorto(f)}: ${comidas[f].snack!.map((x) => x.t).join(', ')}`);

  L.push('', 'CÓMO HA IDO');
  L.push(`Hambre ${d.hambre ?? '–'}/5 · Sueño ${d.sueno ?? '–'}/5 · Energía ${d.energia ?? '–'}/5`);
  L.push(`Salidas de fiesta: ${d.salidas == null ? '–' : SALIDAS[d.salidas].toLowerCase()}`);
  if (d.nota?.trim()) L.push(d.nota.trim());
  return L.join('\r\n');
}

export function mailto(email: string, domingo: string, texto: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(asunto(domingo))}&body=${encodeURIComponent(texto)}`;
}

// Semanas desde el inicio hasta la que se está cerrando, de la más reciente a la
// más antigua: para la tabla «Tus semanas».
export function domingosHasta(domingo: string): string[] {
  const out: string[] = [];
  for (let d = domingo; d >= primerDomingo(); d = sumarDias(d, -7)) out.push(d);
  return out;
}
