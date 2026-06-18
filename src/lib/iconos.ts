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

// Devuelve un <span> con la imagen (Yasmina) y el emoji (resto). El CSS decide cuál se ve.
export function iconoEl(id: string | undefined, emoji: string, px = 22): HTMLElement {
  const span = document.createElement('span');
  span.className = 'ico';
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
