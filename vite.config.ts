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
      includeAssets: ['logo.ico'],
      manifest: {
        name: appName,
        short_name: appName,
        description: 'Aplicativo de Galeria de Fotos',
        theme_color: '#000000',
        icons: [
          {
            src: 'logo.ico',
            sizes: 'any',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ]
  }
})

export default config
