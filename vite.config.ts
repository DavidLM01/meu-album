import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appName = env.VITE_APP_NAME || 'Meu Álbum'

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      includeAssets: ['logo.ico', 'pwa-192x192.png', 'pwa-512x512.png', 'maskable-192x192.png', 'maskable-512x512.png'],
      manifest: {
        name: appName,
        short_name: appName,
        description: 'Aplicativo de Galeria de Fotos',
        theme_color: '#000000',
        background_color: '#000000',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
  }
})

export default config
