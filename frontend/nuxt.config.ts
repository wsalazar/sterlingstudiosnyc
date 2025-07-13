import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  devtools: { enabled: true },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  app: {
    head: {
      title: 'Sterling Studios NYC',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Sterling Studios NYC - Your premier recording studio',
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
    server: {
      hmr: {
        clientPort: 3000,
        protocol: 'ws',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Forward cookies
              if (req.headers.cookie) {
                proxyReq.setHeader('Cookie', req.headers.cookie)
              }
            })
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Forward cookies from backend to frontend
              if (proxyRes.headers['set-cookie']) {
                res.setHeader('Set-Cookie', proxyRes.headers['set-cookie'])
              }
            })
          },
        },
      },
    },
  },
})
