import { hayPatron, svgDot } from './iconos-dot';

// Iconos ilustrados disponibles (perfil Yasmina). El resto de perfiles usan el emoji.
const DISPONIBLES = new Set([
  'ajustes', 'alarma', 'backup', 'borrar',
  'comida-cena', 'comida-desayuno', 'comida-pregym', 'comida-principal', 'comida-snack',
  'deco-matcha', 'descanso',
  'dia-brazo', 'dia-cardio', 'dia-empuje', 'dia-espalda', 'dia-gluteo', 'dia-hombro', 'dia-pierna',
  'energia', 'fallo', 'import-export',
  'jor-ett', 'jor-laboratorio', 'jor-libre', 'jor-manana', 'jor-tarde',
  'medidas', 'nav-dieta', 'nav-entreno', 'nav-hoy', 'nav-progreso',
  'nota', 'perfil', 'record', 'rest-timer', 'sueno', 'superserie',
]);

export function hayIcono(id?: string): boolean {
  return !!id && DISPONIBLES.has(id);
}

// Símbolo del día. Si la rutina guardada no trae `icono` (rutinas anteriores al
// 05/08), se deduce por su posición en la rueda: así nunca cae al emoji.
const SIMBOLOS_DIA = ['dia-empuje', 'dia-hombro', 'dia-pierna', 'dia-bombeo', 'dia-espalda'];

export function iconoDeDia(dias: { id: string }[], dia: { id: string; icono?: string }): string {
  if (dia.icono) return dia.icono;
  const i = dias.findIndex((d) => d.id === dia.id);
  return SIMBOLOS_DIA[(i < 0 ? 0 : i) % SIMBOLOS_DIA.length];
}

// Devuelve un <span> con las tres variantes que puede haber: matriz de puntos
// (Jose), imagen ilustrada (Yasmina) y emoji de reserva. El CSS decide cuál se ve.
export function iconoEl(id: string | undefined, emoji: string, px = 22): HTMLElement {
  const span = document.createElement('span');
  span.className = 'ico';
  if (hayPatron(id)) {
    span.classList.add('has-dot');
    const dot = document.createElement('span');
    dot.className = 'ico-dot-wrap';
    dot.innerHTML = svgDot(id!, px);
    span.appendChild(dot);
  }
  if (id && DISPONIBLES.has(id)) {
    span.classList.add('has-ico');
    const img = document.createElement('img');
    img.className = 'ico-img';
    img.src = `/iconos/${id}.png`;
    img.alt = '';
    img.width = px;
    img.height = px;
    span.appendChild(img);
  }
  const em = document.createElement('span');
  em.className = 'ico-emoji';
  em.textContent = emoji;
  span.appendChild(em);
  return span;
}
