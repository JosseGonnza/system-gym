<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=FF5733&animation=fadeIn&height=120&section=header"/>


# 💪 System GYM

> PWA de entrenamiento construida con **Claude Code** (IA al teclado, humano al
> volante), iterada por sesiones de trabajo. Resuelve un problema concreto:
> saber qué toca hoy, progresar de cargas sin pensar y no perder ni una serie.

Tema oscuro con glow, rollo "Sistema": una app que te incita a subir de nivel.
Sin backend, sin cuentas, sin tracking — todos los datos viven en el IndexedDB
del navegador. **Multi-perfil**: cada usuario con su rutina, dieta, horarios y
tema visual propios.

## Qué hace

- **🗓️ Hoy** — jornada de trabajo con su pauta horaria, entreno sugerido según
  la secuencia (cero deuda de días saltados), contador de descansos semanal con
  aviso, y tarjeta 🌙 Mañana con la hora de la alarma.
- **🏋️ Entreno** — tarjetas de ejercicio una a una, 3 estados por serie
  (✓ completada · 🔥 al fallo · ✗ corta), rest timer a prueba de pantalla
  bloqueada, **motor de progresión automática** (lineal con deload, doble
  progresión, peso corporal → lastre, isométricos por tiempo, guardia de parón)
  y destello «⬆ NUEVO RÉCORD». Cada ejercicio sabe su **implemento** y muestra el
  **peso real** que mueves (la barra + los discos por lado).
- **🍱 Dieta** — macros objetivo y platos plantilla, propios de cada perfil.
- **📊 Progreso** — peso con media semanal contra objetivo, cintura y marcas por
  ejercicio con gráficos SVG sin dependencias.
- **👥 Perfiles** — varios usuarios con datos aislados, selección al abrir y tema
  por perfil (violeta / matcha).

La sesión se autoguarda en cada toque: si se cierra la app a mitad de entreno,
sigue como borrador retomable. Export/import JSON como copia de seguridad.

## Evolución

Hitos grandes del proyecto:

- **v1 · MVP** — las 4 pantallas (Hoy / Entreno / Dieta / Progreso), motor de
  progresión, PWA instalable y offline, persistencia local y export/import JSON.
- **v2 · Biblioteca de ejercicios** — catálogo de ejercicios clasificados
  (implemento, patrón muscular, agarre) reutilizable entre rutinas, y **cálculo
  del peso real** movido en barra/multipower (apuntas un lado, la app suma la
  barra y dobla los discos), con la microcarga correcta por ejercicio.
- **v3 · Multi-perfil** — varios perfiles con almacenamiento aislado por espacio
  de claves, selector al abrir, catálogo de ejercicios compartido y **temas por
  perfil** vía variables CSS, sin coste de recolorear.

## Cómo está hecha

- **Astro 5 + Tailwind 4 + TypeScript** → PWA instalable y offline.
- **IndexedDB** (`idb-keyval`) como única persistencia, con claves namespaced por
  perfil y un catálogo de ejercicios compartido.
- **52 tests** (Vitest) cubren el motor de progresión, el cálculo de peso real,
  el aislamiento multi-perfil y la lógica semanal.
- Construida por bloques con Claude Code: la IA picaba código, el humano decidía.

## Correrla en local

```sh
npm install
npm run dev      # desarrollo
npm test         # tests
npm run build    # producción (dist/)
```

## Notas

App de uso diario que trae **datos de ejemplo de fábrica** (rutinas, dietas y
horarios por perfil). Para adaptarla a lo tuyo, haz fork y edita
`src/lib/seed.ts` (rutinas y catálogo de ejercicios), `src/lib/dietas.ts` y
`src/lib/horarios.ts`.

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=FF5733&height=80&section=footer"/>
