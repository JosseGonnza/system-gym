<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=FF5733&animation=fadeIn&height=120&section=header"/>


# 💪 System GYM

> PWA de entrenamiento construida **con IA (Claude Code)** en
> **menos de una hora** de trabajo, para resolver un problema 100% personal:
> saber qué toca hoy, progresar de cargas sin pensar y no perder ni una serie.

Tema oscuro con violetas y glow, rollo "Sistema": una app que
te incita a subir de nivel. Sin backend, sin cuentas, sin tracking — todos los
datos viven en el IndexedDB de tu móvil.

## Qué hace

- **🗓️ Hoy** — jornada de trabajo (mañana/tarde/libre) con su pauta horaria,
  entreno sugerido según la secuencia (cero deuda de días saltados), contador de
  descansos semanal con aviso, y tarjeta 🌙 Mañana con la hora de la alarma.
- **🏋️ Entreno** — tarjetas de ejercicio una a una, 3 estados por serie
  (✓ completada · 🔥 al fallo · ✗ corta), rest timer a prueba de pantalla
  bloqueada, y **motor de progresión automática**: lineal con deload, doble
  progresión, peso corporal → lastre, isométricos por tiempo, y guardia de
  parón (+14 días). Destello «⬆ NUEVO RÉCORD» al superar marcas.
- **🍱 Dieta** — macros objetivo y platos plantilla de consulta rápida.
- **📊 Progreso** — peso con media semanal contra objetivo, cintura y marcas
  por ejercicio con gráficos SVG sin dependencias.

La sesión se autoguarda en cada toque: si se cierra la app a mitad de entreno,
sigue como borrador retomable. Export/import JSON como copia de seguridad.

## Cómo está hecha

- **Astro 5 + Tailwind 4 + TypeScript** → PWA instalable y offline.
- **IndexedDB** (`idb-keyval`) como única persistencia.
- **33 tests** (Vitest) cubren el motor de progresión y la lógica semanal.
- Construida por bloques con Claude Code: la IA picaba código, el humano decidía.

## Correrla en local

```sh
npm install
npm run dev      # desarrollo
npm test         # tests del motor
npm run build    # producción (dist/)
```

## Aviso

Es una app personal: la rutina, los horarios y los macros que trae de fábrica
son los míos. Si la quieres usar, haz fork y toca `src/lib/seed.ts` (rutina y
config) y `src/lib/horarios.ts` (pautas por turno).

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=FF5733&height=80&section=footer"/>

