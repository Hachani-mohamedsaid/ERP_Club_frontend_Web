import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { scoutMapApiPlugin } from './vite-plugin-scout-map-api'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = (env.VITE_API_PROXY_TARGET ?? 'https://erp-club-backend-production.up.railway.app').replace(/\/$/, '')
  const aiTarget = (env.VITE_AI_PROXY_TARGET ?? 'https://erp-club-ai-service-production.up.railway.app').replace(/\/$/, '')

  if (env.API_FOOTBALL_KEY) process.env.API_FOOTBALL_KEY = env.API_FOOTBALL_KEY
  if (env.VITE_API_FOOTBALL_KEY) process.env.VITE_API_FOOTBALL_KEY = env.VITE_API_FOOTBALL_KEY

  return {
    plugins: [react(), tailwindcss(), scoutMapApiPlugin()],
    optimizeDeps: {
      include: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-three/postprocessing',
        'three/examples/jsm/libs/meshopt_decoder.module.js',
      ],
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ai': {
          target: aiTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/ai/, ''),
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
        },
        '/socket.io': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          ws: true,
        },
      },
    },
  }
})
