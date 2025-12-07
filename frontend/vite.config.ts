import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'icons/*.png'],
          manifest: {
            name: 'Gom Hàng Pro',
            short_name: 'Gom Hàng',
            description: 'Hệ thống quản lý gom hàng Ninh Hiệp',
            theme_color: '#2563eb',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait-primary',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: 'icons/icon-72x72.png',
                sizes: '72x72',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'icons/icon-128x128.png',
                sizes: '128x128',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'icons/icon-144x144.png',
                sizes: '144x144',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'icons/icon-152x152.png',
                sizes: '152x152',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'icons/icon-384x384.png',
                sizes: '384x384',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ],
            shortcuts: [
              {
                name: 'Tạo đơn mới',
                short_name: 'Tạo đơn',
                description: 'Tạo đơn hàng mới',
                url: '/#/worker/create',
                icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96' }]
              },
              {
                name: 'Dashboard',
                short_name: 'Dashboard',
                description: 'Xem dashboard quản lý',
                url: '/#/manager/dashboard',
                icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96' }]
              }
            ],
            categories: ['business', 'productivity']
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            navigateFallback: null, // Tắt navigateFallback để tránh conflict với HashRouter
            navigateFallbackAllowlist: [],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /\/api\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 5 // 5 minutes
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  },
                  networkTimeoutSeconds: 10
                }
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images-cache',
                  expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                  }
                }
              }
            ]
          },
          devOptions: {
            enabled: false, // Tắt PWA trong dev mode để tránh conflict
            type: 'module'
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // React and related
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              // Axios
              if (id.includes('axios')) {
                return 'axios';
              }
              // PDF libraries
              if (id.includes('jspdf')) {
                return 'pdf-vendor';
              }
              // Vite and build tools
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            },
          },
        },
        chunkSizeWarningLimit: 1000,
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            drop_debugger: true,
          },
        },
      },
    };
});
