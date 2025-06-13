import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
  },
  alias: {
    '@': '.',
  },
  app: {
    head: {
      title: 'Sterling Studios NYC',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/images/favicon.png?v=2',
          sizes: '32x32',
        },
        {
          rel: 'shortcut icon',
          href: '/images/favicon.png?v=2',
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/images/favicon.png?v=2',
          sizes: '32x32',
        },
      ],
    },
  },
  pages: true,
  components: {
    global: true,
    dirs: ['@/components'],
  },
  experimental: {
    payloadExtraction: false,
  },
  compatibilityDate: '2025-06-13',
})
