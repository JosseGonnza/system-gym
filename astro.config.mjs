// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  site: 'https://system-gym.pages.dev',
  vite: { plugins: [tailwindcss()] },
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon-96x96.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'System GYM',
        short_name: 'GYM',
        description:
          'Tu "Sistema" de entrenamiento: qué toca hoy, progresión automática de cargas y registro de progreso. Sin backend, sin cuentas: todo vive en tu móvil.',
        lang: 'es',
        theme_color: '#0a0712',
        background_color: '#0a0712',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/',
      },
    }),
  ],
});
