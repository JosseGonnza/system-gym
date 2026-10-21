// Tips de ejecución por ejercicio. Viven en el código, no en el catálogo: así se
// actualizan con un deploy y no engordan cada backup.
//
// El campo que más importa es `error`: qué hacer cuando el ejercicio se nota
// donde no toca (el caso típico: hacer espalda y notar solo el bíceps).

export interface Tip {
  /** Dónde se tiene que notar. En cristiano, no en anatomía. */
  donde: string;
  /** 2-4 claves de ejecución. */
  claves: string[];
  /** El fallo típico y cómo corregirlo. */
  error?: string;
}

export const TIPS: Record<string, Tip> = {
  // ── Tirón: aquí es donde más se cuela el bíceps ──
  'jalon-pecho': {
    donde: 'En la espalda ancha, justo debajo de las axilas.',
    claves: [
      'Antes de tirar, baja los hombros: aleja las orejas.',
      'Tira con los codos hacia el suelo, no con las manos.',
      'Lleva la barra al pecho, no a la nuca. Pecho arriba.',
    ],
    error:
      'Si solo lo notas en el bíceps: agarra más ancho, deja de apretar la barra con fuerza y piensa en llevar los CODOS hacia abajo. Las manos son ganchos, no motores.',
  },
  'remo-maquina': {
    donde: 'Entre los omóplatos y en la espalda de debajo de la axila.',
    claves: [
      'Pecho pegado al respaldo todo el rato.',
      'Lleva los codos hacia atrás, como al bolsillo trasero.',
      'Junta los omóplatos al final y aguanta un segundo.',
    ],
    error:
      'Si lo notas en el bíceps: baja peso y empieza el movimiento juntando los omóplatos ANTES de doblar los codos. Si no llegas a juntarlos, es que pesa demasiado.',
  },
  'remo-polea': {
    donde: 'En el centro de la espalda, entre los omóplatos.',
    claves: [
      'Espalda recta, sin balancearte hacia atrás para tirar.',
      'Codos pegados al cuerpo, llévalos atrás.',
      'Vuelve despacio, dejando que la espalda estire.',
    ],
    error:
      'Si lo notas en el bíceps: saca pecho y junta los omóplatos antes de doblar el codo. Y si te balanceas hacia atrás para tirar, es peso de más — debe moverse el brazo, no el tronco.',
  },
  'remo-maquina-brazo': {
    donde: 'En la espalda del lado que trabajas, debajo de la axila.',
    claves: [
      'Apoya bien el pecho y no gires el tronco para llegar más.',
      'Codo pegado al costado, tira hacia la cadera.',
      'Estira del todo abajo para notar cómo se abre la espalda.',
    ],
  },
  'curl-z': {
    donde: 'En el bíceps, en toda su longitud.',
    claves: [
      'Codos pegados al costado y quietos: no van hacia delante.',
      'Sube sin balancear la espalda.',
      'Baja despacio, controlando: ahí está la mitad del trabajo.',
    ],
    error: 'Si te vas hacia atrás para subir, pesa demasiado. Baja peso y hazlo limpio.',
  },
  'curl-mancuerna': {
    donde: 'En el bíceps.',
    claves: [
      'Codo quieto pegado al cuerpo, solo gira el antebrazo.',
      'Gira la muñeca hacia fuera al subir: aprieta arriba.',
      'Baja controlando hasta estirar del todo.',
    ],
  },
  'curl-polea-cuerda': {
    donde: 'En el bíceps, con tensión constante.',
    claves: [
      'La polea tira siempre: no hay descanso arriba ni abajo.',
      'Codos fijos al costado.',
      'Separa las manos arriba para apretar más.',
    ],
  },

  // ── Empuje ──
  'press-banca-maquina': {
    donde: 'En el pecho, sobre todo en la parte de fuera.',
    claves: [
      'Ajusta el asiento para que las asas queden a la altura del pecho.',
      'Saca pecho y junta un poco los omóplatos contra el respaldo.',
      'Empuja sin bloquear el codo del todo al final.',
    ],
    error:
      'Si lo notas todo en el hombro delantero: baja el asiento un punto y no dejes que los codos suban por encima de la línea del hombro.',
  },
  'press-inclinado-maquina': {
    donde: 'En la parte de arriba del pecho, hacia la clavícula.',
    claves: [
      'Codos a unos 45°, no abiertos del todo.',
      'Baja hasta notar el estiramiento, sin forzar el hombro.',
      'Empuja hacia arriba y ligeramente hacia dentro.',
    ],
  },
  'press-banca': {
    donde: 'En el pecho.',
    claves: [
      'Pies firmes, glúteo en el banco, omóplatos juntos.',
      'Baja la barra al esternón, con los codos a 45°.',
      'Muñeca recta sobre el antebrazo, no doblada hacia atrás.',
    ],
    error: '⚠️ Nunca en frío: dos series ligeras antes, que los codos avisan.',
  },
  'press-inclinado-mancuerna': {
    donde: 'En la parte alta del pecho.',
    claves: [
      'Inclinación de 30°, no más: por encima trabaja el hombro.',
      'Baja hasta la altura del pecho, sin hundir los hombros.',
      'Las mancuernas se juntan un poco arriba, sin chocar.',
    ],
  },
  'pec-deck': {
    donde: 'En el centro del pecho, al juntar.',
    claves: [
      'Codo ligeramente doblado y fijo: es un abrazo, no un empuje.',
      'Aprieta un segundo al juntar.',
      'Abre despacio hasta notar el estiramiento, sin pasarte.',
    ],
    error: 'Si notas tirón en la parte delantera del hombro, reduce la apertura hacia atrás.',
  },
  'fondos-paralelas': {
    donde: 'En el pecho bajo y el tríceps.',
    claves: [
      'Inclínate un poco hacia delante para cargar más pecho.',
      'Baja solo hasta donde el hombro no proteste.',
      'No bloquees el codo del todo arriba.',
    ],
    error: '⚠️ Codos en frío, con cuidado. Si pinchan al estirar, baja el volumen de tríceps.',
  },
  'press-militar-mancuerna': {
    donde: 'En el hombro, por delante y por el lateral.',
    claves: [
      'Aprieta el abdomen para no arquear la espalda.',
      'Codos ligeramente hacia delante, no en cruz.',
      'Sube sin encoger los hombros hacia las orejas.',
    ],
  },
  'extension-triceps-polea': {
    donde: 'En la parte de atrás del brazo.',
    claves: [
      'Codos pegados al costado y quietos: solo se mueve el antebrazo.',
      'Estira del todo abajo y aprieta.',
      'No te eches hacia delante para empujar con el cuerpo.',
    ],
  },

  // ── Hombro y postura ──
  'elevacion-lateral': {
    donde: 'En el lateral del hombro, como una hombrera.',
    claves: [
      'Sube con el meñique un pelín más alto que el pulgar, como al vaciar una jarra.',
      'No pases de la altura del hombro.',
      'Sin balanceo: si necesitas impulso, pesa demasiado.',
    ],
    error:
      'Si lo notas en el cuello o el trapecio: baja peso y hunde los hombros antes de empezar. Es de los ejercicios donde menos peso hace falta.',
  },
  'face-pull': {
    donde: 'En la parte de atrás del hombro y entre los omóplatos.',
    claves: [
      'Tira hacia la cara, separando las manos, y acaba con los nudillos mirando atrás.',
      'Codos altos, a la altura de los hombros.',
      'Peso ligero siempre: esto es salud, no fuerza.',
    ],
  },
  'pajaros-crossover': {
    donde: 'En la parte de atrás del hombro.',
    claves: [
      'Codo casi estirado y fijo, abre en arco.',
      'Sin encoger el cuello: hombros lejos de las orejas.',
      'Ligero y controlado, sin coger impulso.',
    ],
  },
  'encogimiento-trapecio': {
    donde: 'En el trapecio, entre el cuello y el hombro.',
    claves: [
      'Sube recto, hacia las orejas. No hagas círculos.',
      'Aguanta arriba un segundo.',
      'Brazos relajados: solo tiran los hombros.',
    ],
  },

  // ── Pierna y glúteo ──
  'hip-thrust': {
    donde: 'En el glúteo, y sobre todo arriba del todo.',
    claves: [
      'El borde del banco justo debajo de los omóplatos.',
      'Barbilla al pecho y mirada al frente durante todo el movimiento.',
      'Sube hasta que el cuerpo quede recto y APRIETA el glúteo un segundo.',
    ],
    error:
      'Si lo notas en la espalda baja: estás subiendo de más, arqueando la zona lumbar. Para cuando el cuerpo esté recto, ni un centímetro más.',
  },
  'patada-gluteo': {
    donde: 'En el glúteo de la pierna que trabaja.',
    claves: [
      'Aprieta el abdomen para no arquear la espalda.',
      'Empuja con el talón, no con la punta.',
      'Aprieta arriba y vuelve despacio.',
    ],
    error: 'Si lo notas en la lumbar, reduce el recorrido: no hace falta subir tanto.',
  },
  'abduccion-cadera': {
    donde: 'En el lateral del glúteo, un poco por encima de la cadera.',
    claves: [
      'Tronco firme: no te inclines para abrir más.',
      'Abre despacio y vuelve con control, sin dejar caer.',
      'Con tobillera en polea o con banda: las dos valen.',
    ],
    error: 'Si lo notas en la espalda o el flexor, baja peso y reduce el recorrido.',
  },
  'rumano-mancuerna': {
    donde: 'En la parte de atrás del muslo, estirándose.',
    claves: [
      'Lleva la cadera ATRÁS, como si cerraras un cajón con el culo.',
      'Rodillas casi rectas, solo un poco blandas.',
      'Baja solo hasta donde estire el isquio, sin redondear la espalda.',
    ],
    error:
      '⚠️ Si lo notas en la lumbar es que la espalda se está redondeando. Baja menos y mantén el pecho abierto. Mejor poco recorrido bien que mucho mal.',
  },
  'prensa-horizontal': {
    donde: 'En el cuádriceps y el glúteo.',
    claves: [
      'Espalda y cadera pegadas al asiento todo el rato.',
      'Pies a la anchura de la cadera, empuja con todo el pie.',
      'No bloquees las rodillas del final.',
    ],
    error:
      '⚠️ Rango parcial, sin dolor de rótula. Si la cadera se despega abajo, estás bajando de más — ahí es donde se castiga la zona lumbar.',
  },
  'extension-cuadriceps': {
    donde: 'En la parte de delante del muslo, sobre todo cerca de la rodilla.',
    claves: [
      'Sube sin dar tirones y aguanta arriba un segundo.',
      'Baja despacio, sin dejar caer el peso.',
      'Espalda apoyada, sin despegar el culo del asiento.',
    ],
    error:
      '⚠️ Con condromalacia, trabaja solo el tramo FINAL (rodilla casi estirada). Ahí la rótula sufre menos y se fortalece la parte interna del cuádriceps, que es lo que la estabiliza.',
  },
  'curl-femoral': {
    donde: 'En la parte de atrás del muslo.',
    claves: [
      'Ajusta el rodillo justo encima del talón.',
      'Aprieta abajo un segundo antes de volver.',
      'Vuelve despacio: no dejes que el peso tire de ti.',
    ],
    error: 'Si te dan calambres, baja peso y sube reps: el isquio se calambra con facilidad.',
  },
  'gemelo-prensa': {
    donde: 'En el gemelo, en toda su longitud.',
    claves: [
      'Recorrido completo: estira abajo del todo y sube a la punta.',
      'Despacio, sin rebotar.',
      'Aguanta arriba un segundo en cada repetición.',
    ],
  },
  hiperextension: {
    donde: 'En la espalda baja y el glúteo.',
    claves: [
      'Sube hasta que el cuerpo quede RECTO, ni un grado más.',
      'Baja controlando, sin dejarte caer.',
      'Sin peso las primeras semanas.',
    ],
    error:
      '⚠️ Pasarse de la línea recta comprime las lumbares justo donde más palanca hay. Es el error que convierte un ejercicio preventivo en uno lesivo.',
  },

  // ── Core ──
  plancha: {
    donde: 'En todo el abdomen, sujetando.',
    claves: [
      'Cuerpo en línea recta: culo ni arriba ni hundido.',
      'Aprieta abdomen y glúteo a la vez.',
      'Respira. No aguantes el aire.',
    ],
    error: 'Si lo notas en la lumbar, mete un poco la pelvis y aprieta más el glúteo.',
  },
  'crunch-polea': {
    donde: 'En el abdomen, al acortarlo.',
    claves: [
      'De rodillas, redondea la espalda alta llevando las costillas a la cadera.',
      'La cadera no se mueve: no es una reverencia.',
      'Vuelve despacio sin perder la tensión.',
    ],
    error: 'Si tiras con los brazos, sujeta la cuerda pegada a la cabeza y olvídate de ellos.',
  },
  'crunch-declinado': {
    donde: 'En el abdomen, sobre todo la parte de arriba.',
    claves: [
      'Pies bien enganchados y manos en el pecho, no detrás de la nuca.',
      'Sube enrollando la espalda vértebra a vértebra, no en bloque.',
      'Para cuando el abdomen deja de acortarse: no hace falta llegar arriba del todo.',
    ],
    error: 'Si lo notas en el cuello o en la cadera, acorta el recorrido y piensa en llevar las costillas al ombligo.',
  },
  'elevacion-piernas': {
    donde: 'En la parte baja del abdomen.',
    claves: [
      'Empieza pegando la lumbar al respaldo o al suelo.',
      'Sube con control, sin balancearte.',
      'Baja despacio y para antes de que la espalda se despegue.',
    ],
  },
  'dead-bug': {
    donde: 'En el abdomen profundo, sujetando la espalda.',
    claves: [
      'La lumbar pegada al suelo TODO el rato: es lo único que importa.',
      'Baja brazo y pierna contrarios despacio.',
      'Si la espalda se despega, acorta el recorrido.',
    ],
  },
  'bird-dog': {
    donde: 'En el abdomen y el glúteo, estabilizando.',
    claves: [
      'Estira brazo y pierna contrarios sin que la cadera se incline.',
      'Imagina que llevas un vaso de agua en la espalda baja.',
      'Despacio: esto es control, no repeticiones.',
    ],
  },

  // ── Cardio ──
  'cardio-cinta': {
    donde: 'Piernas y respiración. Sin impacto en la rodilla si vas andando en inclinación.',
    claves: [
      'Inclinación en vez de velocidad: quema igual y no castiga las rodillas.',
      'No te agarres al frontal: rompe la postura y hace que cuente menos.',
      'Ritmo al que podrías hablar con frases cortas.',
    ],
  },
  'cardio-eliptica': {
    donde: 'Piernas y glúteo, sin impacto.',
    claves: [
      'Talón apoyado en todo momento, no de puntillas.',
      'Usa también los brazos: empuja y tira.',
      'Postura erguida, sin colgarte de los agarres.',
    ],
  },
  'cardio-bici': {
    donde: 'Cuádriceps y glúteo.',
    claves: [
      'Sillín a la altura de la cadera: la rodilla casi estirada abajo.',
      'Si la rodilla queda muy cerrada arriba, el sillín está bajo.',
      'Mejor resistencia media y cadencia cómoda que ir a tirones.',
    ],
  },
  'cardio-caminar': {
    donde: 'Todo el cuerpo, suave.',
    claves: [
      'Cuenta igual que el gimnasio. La constancia gana a la intensidad.',
      'Ritmo alegre, del que calienta un poco.',
      'Ideal el día después de pierna: ayuda a recuperar.',
    ],
  },
};

export function hayTip(ejercicioId?: string): boolean {
  return !!ejercicioId && ejercicioId in TIPS;
}

export function tipDe(ejercicioId?: string): Tip | undefined {
  return ejercicioId ? TIPS[ejercicioId] : undefined;
}
