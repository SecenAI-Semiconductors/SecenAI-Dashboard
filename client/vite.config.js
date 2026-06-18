import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Automatically register the service worker
      registerType: 'autoUpdate',

      // Include common static assets for precaching
      includeAssets: ['favicon.svg', 'icons/*.png'],

      // Web App Manifest configuration
      manifest: {
        name: 'SecenAI',
        short_name: 'SecenAI',
        description: 'SecenAI Agriculture Dashboard — smart farming tools, soil intelligence, weather insights, and crop analytics.',
        start_url: '/',
        display: 'standalone',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      // Workbox configuration — use defaults for caching strategies
      workbox: {
        // Precache common file types
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // Fallback to index.html for SPA navigation
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },

      // Generate SW in dev for testing (optional, disabled by default)
      devOptions: {
        enabled: true,
        suppressWarnings: true,
      },
    }),
  ],
})
