// Técnica de los ejercicios de Jeik: tres pasos, un aviso para la espalda y un
// dibujo animado entre la posición de salida y la final. Vive en el código,
// como los tips, y se dibuja en SVG para no depender de vídeos.

export interface Tecnica {
  pasos: string[];
  espalda: string;
}

type Pt = [number, number];
// De perfil por ángulos (grados, 0 = derecha, 90 = abajo) o de frente por
// desplazamientos desde hombros (sy) y cadera (hy).
interface Postura {
  hip?: Pt;
  t?: number;
  th?: number;
  sh?: number;
  ua?: number;
  fa?: number;
  cx?: number;
  sy?: number;
  hy?: number;
  e?: Pt;
  h?: Pt;
  eL?: Pt;
  hL?: Pt;
  k?: Pt;
  p?: Pt;
}
type Linea = ['l', number, number, number, number];
// c = cable y v = palanca desde un punto fijo; p = barra centrada en un ancla; o = pieza redonda.
type Pieza = ['c' | 'v', number, number, string] | ['p', string, number, number] | ['o', string, number];
// a = posición de salida, b = lo que cambia al final del movimiento.
interface Dibujo {
  maq: Linea[];
  a: Postura;
  b: Partial<Postura>;
  din: Pieza[];
}
interface Pose {
  cabeza: Pt;
  seg: [Pt, Pt][];
  ancla: Record<string, Pt>;
}

export const TECNICA: Record<string, Tecnica> = {
  'prensa-horizontal': { pasos: ['Espalda y culo pegados al respaldo. Pies en el centro de la plataforma, a la anchura de los hombros.', 'Baja despacio llevando las rodillas hacia el pecho.', 'Empuja con todo el pie hasta casi estirar, sin bloquear las rodillas.'], espalda: 'Baja solo hasta donde el culo siga pegado al asiento. Si notas que la zona lumbar se despega o se redondea, has bajado de más: corta ahí el recorrido.' },
  'curl-femoral': { pasos: ['La rodilla, alineada con el eje de la máquina. El rodillo de abajo, justo encima del talón.', 'Lleva el rodillo hacia abajo y atrás doblando las rodillas todo lo que puedas.', 'Vuelve despacio, en dos o tres segundos.'], espalda: 'La versión sentada cuida más tu espalda que la tumbada. Baja bien el rodillo de los muslos y no te separes del respaldo.' },
  'jalon-pecho': { pasos: ['Siéntate con los muslos bien sujetos bajo el rodillo.', 'Saca pecho y tira llevando los codos hacia abajo, hasta que el agarre llegue a la parte alta del pecho.', 'Sube despacio hasta estirar los brazos del todo.'], espalda: 'Échate atrás solo un poco y sin balancearte. Si necesitas dar un tirón con el cuerpo, sobra peso.' },
  'press-banca-maquina': { pasos: ['Ajusta el asiento para que los agarres queden a mitad del pecho.', 'Empuja hasta casi estirar los brazos, sin despegar los hombros del respaldo.', 'Vuelve despacio hasta notar que se estira el pecho.'], espalda: 'Espalda entera apoyada en el respaldo y pies firmes en el suelo. No arquees la zona lumbar para empujar más.' },
  'elevacion-lateral-polea': { pasos: ['De lado a la polea baja. Agarra con la mano de fuera; el cable pasa por delante del cuerpo.', 'Sube el brazo hacia el lado, con el codo un poco doblado, hasta la altura del hombro.', 'Baja despacio. Todas las de un brazo y luego el otro.'], espalda: 'Rodillas un poco flojas y abdomen apretado. Si te tienes que inclinar para subir, baja el peso.' },
  plancha: { pasos: ['Antebrazos en el suelo con los codos justo debajo de los hombros, y apoyado en las puntas de los pies.', 'Aprieta culo y abdomen hasta que el cuerpo quede recto de la cabeza a los talones.', 'Aguanta respirando normal. Apunta los segundos en reps.'], espalda: 'Si notas la zona lumbar, se te ha caído la cadera: sube un poco el culo o apoya las rodillas.' },
  'dead-bug': { pasos: ['Tumbado boca arriba, brazos estirados hacia el techo y rodillas dobladas en el aire, a 90°.', 'Estira a la vez un brazo hacia atrás y la pierna contraria hacia delante, despacio y sin tocar el suelo.', 'Vuelve al centro y cambia de lado. Cada lado cuenta una.'], espalda: 'La zona lumbar pegada al suelo todo el rato. Si se despega, no estires tanto la pierna.' },
  'extension-cuadriceps': { pasos: ['La rodilla, alineada con el eje de la máquina. El rodillo, por delante del tobillo.', 'Estira las piernas del todo y aprieta un segundo arriba.', 'Baja despacio, en dos o tres segundos.'], espalda: 'Agárrate a las asas y no despegues el culo del asiento.' },
  'remo-maquina': { pasos: ['Pecho apoyado en el cojín. Ajusta el asiento para llegar a los agarres con los brazos estirados.', 'Tira llevando los codos hacia atrás, pegados al cuerpo, y junta los omóplatos.', 'Vuelve despacio hasta estirar los brazos.'], espalda: 'El cojín te sujeta la espalda; por eso sustituye al remo en polea. No te separes de él para tirar más.' },
  'press-inclinado-maquina': { pasos: ['Ajusta el asiento para que las asas queden a la altura de la parte alta del pecho.', 'Empuja hacia arriba y al frente hasta casi estirar los brazos.', 'Baja despacio hasta notar el pecho estirado, sin que los codos se vayan muy por detrás del cuerpo.'], espalda: 'Espalda y culo pegados al respaldo, pies firmes en el suelo. Si para empujar despegas la espalda, sobra peso.' },
  'pec-deck': { pasos: ['Sube o baja el asiento hasta que los brazos queden a la altura del pecho.', 'Junta los brazos por delante como si abrazaras un árbol, sin bloquear los codos.', 'Abre despacio hasta notar que se estira el pecho.'], espalda: 'Espalda apoyada en el respaldo todo el rato.' },
  'abductor-maquina': { pasos: ['Siéntate al fondo, con los cojines por fuera de las rodillas.', 'Abre las piernas todo lo que puedas y aguanta un segundo.', 'Cierra despacio, sin que choquen las placas.'], espalda: 'Trabaja el glúteo de los lados, que ayuda a sujetar la cadera y la zona lumbar. Espalda pegada al respaldo.' },
  'extension-triceps-polea': { pasos: ['De pie frente a la polea alta, con los codos pegados a los costados.', 'Empuja la barra hacia abajo hasta estirar los brazos; solo se mueven los antebrazos.', 'Sube despacio hasta la altura del pecho.'], espalda: 'Rodillas un poco flojas y cuerpo quieto. No te eches encima de la barra.' },
  'jalon-maquina': { pasos: ['Muslos sujetos bajo el rodillo y pecho fuera.', 'Tira de los agarres llevando los codos hacia los costados.', 'Sube despacio hasta estirar los brazos.'], espalda: 'Sin balanceos: el tronco, casi quieto.' },
  'press-hombro-maquina': { pasos: ['Ajusta el asiento para que los agarres queden a la altura de los hombros.', 'Empuja hacia arriba hasta casi estirar los brazos.', 'Baja despacio hasta la altura de las orejas.'], espalda: 'Espalda pegada al respaldo de arriba abajo. Si tienes que arquearte para subir, baja el peso.' },
  'curl-polea-barra': { pasos: ['De pie frente a la polea baja, con los codos pegados a los costados.', 'Sube la barra doblando los codos, sin llevarlos hacia delante.', 'Baja despacio hasta estirar.'], espalda: 'Rodillas un poco flojas y sin echar el cuerpo atrás. Si necesitas balancearte, sobra peso.' },
};

const SENTADO: Linea[] = [['l', 58, 116, 112, 116], ['l', 84, 116, 84, 147]];
const RESPALDO: Linea[] = [['l', 71, 116, 71, 40]];
const JALON: { a: Postura; b: Partial<Postura> } = { a: { hip: [80, 108], t: -100, th: 0, sh: 90, ua: -65, fa: -78 }, b: { ua: 100, fa: -70 } };
const DIBUJO: Record<string, Dibujo> = {
  'prensa-horizontal': { maq: [['l', 30, 71, 76, 117], ['l', 76, 117, 76, 147], ['l', 92, 108, 172, 46]], a: { hip: [70, 105], t: -135, th: -30, sh: -30, ua: 50, fa: 20 }, b: { th: -70, sh: 20 }, din: [['p', 'ank', 26, 52]] },
  'curl-femoral': { maq: [['l', 58, 116, 120, 116], ['l', 84, 116, 84, 147], ['l', 68, 116, 63, 46], ['l', 100, 100, 124, 100]], a: { hip: [80, 108], t: -95, th: 0, sh: 0, ua: 80, fa: 0 }, b: { sh: 100 }, din: [['o', 'ank', 7]] },
  'jalon-pecho': { maq: SENTADO.concat([['l', 106, 99, 126, 99]]), a: JALON.a, b: JALON.b, din: [['c', 88, 2, 'hand'], ['p', 'hand', 12, 0]] },
  'jalon-maquina': { maq: SENTADO.concat([['l', 106, 99, 126, 99]]), a: JALON.a, b: JALON.b, din: [['v', 128, 24, 'hand'], ['p', 'hand', 12, 90]] },
  'press-banca-maquina': { maq: SENTADO.concat(RESPALDO), a: { hip: [80, 108], t: -90, th: 0, sh: 90, ua: 130, fa: -15 }, b: { ua: 5, fa: 5 }, din: [['p', 'hand', 14, 90]] },
  'elevacion-lateral-polea': { maq: [['l', 64, 40, 64, 147]], a: { cx: 100, sy: 36, hy: 74, e: [4, 26], h: [6, 50], eL: [-10, 24], hL: [-22, 40], k: [2, 37], p: [2, 73] }, b: { e: [26, -2], h: [49, -4] }, din: [['c', 64, 140, 'handR']] },
  plancha: { maq: [], a: { hip: [110, 122], t: 185, th: 19, sh: 19, ua: 90, fa: 180 }, b: {}, din: [] },
  'dead-bug': { maq: [], a: { hip: [112, 139], t: 180, th: -90, sh: 0, ua: -90, fa: -90 }, b: { th: -15, sh: -5, ua: -170, fa: -170 }, din: [] },
  'extension-cuadriceps': { maq: [['l', 58, 116, 116, 116], ['l', 84, 116, 84, 147], ['l', 68, 116, 63, 46]], a: { hip: [80, 108], t: -95, th: 0, sh: 95, ua: 80, fa: 0 }, b: { sh: 0 }, din: [['o', 'ank', 7]] },
  'remo-maquina': { maq: SENTADO.concat([['l', 94, 60, 94, 100]]), a: { hip: [80, 108], t: -85, th: 0, sh: 90, ua: 8, fa: 8 }, b: { ua: 160, fa: 5 }, din: [['p', 'hand', 12, 90]] },
  'press-inclinado-maquina': { maq: [['l', 24, 10, 24, 147], ['l', 82, 110, 36, 72], ['l', 70, 104, 70, 147]], a: { hip: [80, 100], t: -140, th: 15, sh: 95, ua: 110, fa: -70 }, b: { ua: -85, fa: -85 }, din: [['v', 24, 40, 'hand'], ['o', 'hand', 5]] },
  'pec-deck': { maq: [['l', 30, 14, 170, 14], ['l', 30, 14, 30, 147], ['l', 170, 14, 170, 147], ['l', 84, 113, 116, 113]], a: { cx: 100, sy: 62, hy: 106, e: [26, 0], h: [26, -24], k: [2, 10], p: [4, 41] }, b: { e: [6, 2], h: [-8, -22] }, din: [] },
  'abductor-maquina': { maq: [['l', 82, 114, 118, 114], ['l', 100, 114, 100, 147]], a: { cx: 100, sy: 62, hy: 106, e: [6, 22], h: [10, 40], k: [-2, 10], p: [0, 41] }, b: { k: [16, 8], p: [14, 40] }, din: [['o', 'kneeR', 6], ['o', 'kneeL', 6]] },
  'extension-triceps-polea': { maq: [], a: { hip: [80, 74], t: -80, th: 85, sh: 95, ua: 95, fa: -40 }, b: { fa: 85 }, din: [['c', 118, 2, 'hand'], ['o', 'hand', 4]] },
  'press-hombro-maquina': { maq: SENTADO.concat([['l', 71, 116, 71, 24]]), a: { hip: [80, 108], t: -90, th: 0, sh: 90, ua: 100, fa: -75 }, b: { ua: -85, fa: -88 }, din: [['p', 'hand', 10, 90]] },
  'curl-polea-barra': { maq: [], a: { hip: [80, 74], t: -90, th: 85, sh: 95, ua: 95, fa: 90 }, b: { fa: -55 }, din: [['c', 122, 140, 'hand'], ['o', 'hand', 4]] },
};

const LARGO = { t: 44, th: 38, sh: 36, ua: 27, fa: 25 };
const pt = (o: Pt, a: number, l: number): Pt => [o[0] + l * Math.cos((a * Math.PI) / 180), o[1] + l * Math.sin((a * Math.PI) / 180)];
const suma = (o: Pt, d: Pt): Pt => [o[0] + d[0], o[1] + d[1]];
const espejo = (d: Pt): Pt => [-d[0], d[1]];

function pose(f: Postura): Pose {
  if (f.cx != null) {
    const sy = f.sy!, hy = f.hy!;
    const sR: Pt = [f.cx + 13, sy], sL: Pt = [f.cx - 13, sy], cR: Pt = [f.cx + 8, hy], cL: Pt = [f.cx - 8, hy];
    const eR = suma(sR, f.e!), handR = suma(sR, f.h!), eL = suma(sL, f.eL ?? espejo(f.e!)), handL = suma(sL, f.hL ?? espejo(f.h!));
    const kneeR = suma(cR, f.k!), kneeL = suma(cL, espejo(f.k!));
    return {
      cabeza: [f.cx, sy - 16],
      seg: [[[f.cx, sy - 6], [f.cx, hy]], [sL, sR], [cL, cR], [sR, eR], [eR, handR], [sL, eL], [eL, handL], [cR, kneeR], [kneeR, suma(cR, f.p!)], [cL, kneeL], [kneeL, suma(cL, espejo(f.p!))]],
      ancla: { handR, handL, kneeR, kneeL },
    };
  }
  const sho = pt(f.hip!, f.t!, LARGO.t), elb = pt(sho, f.ua!, LARGO.ua), hand = pt(elb, f.fa!, LARGO.fa);
  const knee = pt(f.hip!, f.th!, LARGO.th), ank = pt(knee, f.sh!, LARGO.sh);
  return { cabeza: pt(sho, f.t!, 13), seg: [[f.hip!, sho], [f.hip!, knee], [knee, ank], [sho, elb], [elb, hand]], ancla: { hand, ank, knee } };
}

export function hayTecnica(ejercicioId?: string): boolean {
  return !!ejercicioId && ejercicioId in TECNICA;
}

export function tecnicaDe(ejercicioId?: string): Tecnica | undefined {
  return ejercicioId ? TECNICA[ejercicioId] : undefined;
}

// SVG del movimiento: la figura va y vuelve; en ámbar tenue, dónde acaba. Con
// movimiento reducido se queda quieta en la salida, con el final marcado.
export function dibujoSVG(ejercicioId: string, mover = true): string | null {
  const d = DIBUJO[ejercicioId];
  if (!d) return null;
  const A = pose(d.a), B = pose({ ...d.a, ...d.b });
  const n1 = (n: number) => n.toFixed(1);
  const anim = (tag: string, cls: string, va: Record<string, number>, vb: Record<string, number>) => {
    let s = `<${tag} class="${cls}"`, an = '';
    for (const k of Object.keys(va)) {
      s += ` ${k}="${n1(va[k])}"`;
      if (mover && Math.abs(va[k] - vb[k]) > 0.05)
        an += `<animate attributeName="${k}" values="${n1(va[k])};${n1(vb[k])};${n1(va[k])}" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="3.4s" repeatCount="indefinite"/>`;
    }
    return s + (an ? `>${an}</${tag}>` : '/>');
  };
  const linea = (cls: string, p: Pt, q: Pt, p2: Pt, q2: Pt) =>
    anim('line', cls, { x1: p[0], y1: p[1], x2: q[0], y2: q[1] }, { x1: p2[0], y1: p2[1], x2: q2[0], y2: q2[1] });
  const pieza = (P: Pose, x: Exclude<Pieza, ['o', string, number]>): [Pt, Pt] => {
    if (x[0] === 'p') {
      const c = P.ancla[x[1]], v = pt([0, 0], x[3], x[2] / 2);
      return [[c[0] - v[0], c[1] - v[1]], [c[0] + v[0], c[1] + v[1]]];
    }
    return [[x[1], x[2]], P.ancla[x[3]]];
  };
  const din = d.din
    .map((x) => {
      if (x[0] === 'o') {
        const a = A.ancla[x[1]], b = B.ancla[x[1]];
        return anim('circle', 'pieza', { cx: a[0], cy: a[1], r: x[2] }, { cx: b[0], cy: b[1], r: x[2] });
      }
      const pa = pieza(A, x), pb = pieza(B, x);
      return linea({ c: 'cable', v: 'palanca', p: 'pieza' }[x[0]], pa[0], pa[1], pb[0], pb[1]);
    })
    .join('');
  return (
    '<svg viewBox="0 0 200 150" role="img" aria-label="Dibujo del movimiento">' +
    '<line class="suelo" x1="8" y1="148" x2="192" y2="148"/>' +
    d.maq.map((l) => `<line class="maq" x1="${l[1]}" y1="${l[2]}" x2="${l[3]}" y2="${l[4]}"/>`).join('') +
    B.seg.map((g) => `<line class="fantasma" x1="${n1(g[0][0])}" y1="${n1(g[0][1])}" x2="${n1(g[1][0])}" y2="${n1(g[1][1])}"/>`).join('') +
    `<circle class="fantasma-c" cx="${n1(B.cabeza[0])}" cy="${n1(B.cabeza[1])}" r="8"/>` +
    din +
    A.seg.map((g, i) => linea('cuerpo', g[0], g[1], B.seg[i][0], B.seg[i][1])).join('') +
    anim('circle', 'cabeza', { cx: A.cabeza[0], cy: A.cabeza[1], r: 8 }, { cx: B.cabeza[0], cy: B.cabeza[1], r: 8 }) +
    '</svg>'
  );
}
