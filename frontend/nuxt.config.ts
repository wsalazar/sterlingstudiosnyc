import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt', 'nuxt-primevue'],
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
      link: [{ rel: 'icon', type: 'image/png', href: '/images/favicon.png' }],
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
      proxy: {
        '/v1/gallery': {
          target: 'http://localhost:3001', // this will have to change for production
          changeOrigin: true,
        },
      },
      hmr: {
        clientPort: 3000,
        protocol: 'ws',
      },
    },
  },
})
