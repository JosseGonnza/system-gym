// Aire del bosque (Grimorio de Yasmina): luciérnagas que laten y hojas de otoño
// que caen, en un canvas fijo detrás de todo. Portado de la maqueta aprobada.
// Ahorro de batería: DPR máx. 2, ~30 fps, se para con la app en segundo plano
// y con "reducir movimiento" pinta un solo fotograma quieto.

interface Bicho { x: number; y: number; r: number; f: number; vx: number; vy: number }
interface Hoja { x: number; y: number; s: number; a: number; va: number; vy: number; sw: number; c: string }

const COLORES = ['#d9733b', '#c98a3a', '#a6552a', '#b9a04f'];
const PASO_MS = 1000 / 30;

export function arrancarAire(cv: HTMLCanvasElement): () => void {
  const ctx = cv.getContext('2d');
  if (!ctx) return () => {};
  const quieto = matchMedia('(prefers-reduced-motion: reduce)');
  let w = 0;
  let h = 0;

  const medir = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.clientWidth;
    h = cv.clientHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  medir();

  const bichos: Bicho[] = Array.from({ length: 16 }, () => ({
    x: Math.random() * w, y: Math.random() * h, r: 1 + Math.random() * 1.4, f: Math.random() * 6.28,
    vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.12,
  }));
  const hojas: Hoja[] = Array.from({ length: 5 }, (_, i) => ({
    x: Math.random() * w, y: Math.random() * h, s: 5 + Math.random() * 4, a: Math.random() * 6.28,
    va: (Math.random() - 0.5) * 0.02, vy: 0.25 + Math.random() * 0.25, sw: Math.random() * 6.28, c: COLORES[i % COLORES.length],
  }));

  const pintarHoja = (l: Hoja) => {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.a);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = l.c;
    ctx.beginPath();
    ctx.moveTo(0, -l.s);
    ctx.quadraticCurveTo(l.s * 0.8, 0, 0, l.s);
    ctx.quadraticCurveTo(-l.s * 0.8, 0, 0, -l.s);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,10,4,.5)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -l.s);
    ctx.lineTo(0, l.s);
    ctx.stroke();
    ctx.restore();
  };

  // Las velocidades de la maqueta son por fotograma a 60 fps: a 30 fps se
  // avanza el doble por paso para que el ritmo sea el mismo.
  const pintar = (t: number, mover: boolean) => {
    const k = 2;
    ctx.clearRect(0, 0, w, h);
    for (const b of bichos) {
      if (mover) {
        b.x += (b.vx + Math.sin(t / 2000 + b.f) * 0.1) * k;
        b.y += (b.vy + Math.cos(t / 2600 + b.f) * 0.08) * k;
      }
      if (b.x < -5) b.x = w + 5;
      if (b.x > w + 5) b.x = -5;
      if (b.y < -5) b.y = h + 5;
      if (b.y > h + 5) b.y = -5;
      const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t / 700 + b.f));
      const gr = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 6);
      gr.addColorStop(0, `rgba(240,214,150,${a})`);
      gr.addColorStop(0.25, `rgba(220,190,110,${a * 0.4})`);
      gr.addColorStop(1, 'rgba(220,190,110,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 6, 0, 6.28);
      ctx.fill();
    }
    for (const l of hojas) {
      if (mover) {
        l.y += l.vy * k;
        l.sw += 0.012 * k;
        l.x += Math.sin(l.sw) * 0.35 * k;
        l.a += (l.va + Math.sin(l.sw) * 0.006) * k;
      }
      if (l.y > h + 12) {
        l.y = -12;
        l.x = Math.random() * w;
      }
      pintarHoja(l);
    }
  };

  let raf = 0;
  let ultimo = 0;
  const bucle = (t: number) => {
    raf = requestAnimationFrame(bucle);
    if (t - ultimo < PASO_MS) return;
    ultimo = t;
    pintar(t, true);
  };
  const parar = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const seguir = () => {
    if (raf || document.hidden) return;
    if (quieto.matches) {
      pintar(performance.now(), false);
      return;
    }
    raf = requestAnimationFrame(bucle);
  };

  const alCambiarVisibilidad = () => (document.hidden ? parar() : seguir());
  const alCambiarMovimiento = () => {
    parar();
    seguir();
  };
  const alRedimensionar = () => {
    medir();
    if (!raf) pintar(performance.now(), false);
  };

  document.addEventListener('visibilitychange', alCambiarVisibilidad);
  quieto.addEventListener('change', alCambiarMovimiento);
  addEventListener('resize', alRedimensionar);
  seguir();

  return () => {
    parar();
    document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    quieto.removeEventListener('change', alCambiarMovimiento);
    removeEventListener('resize', alRedimensionar);
  };
}
