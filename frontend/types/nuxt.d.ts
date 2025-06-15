declare module '#imports' {
  export const defineNuxtRouteMiddleware: (typeof import('nuxt/app'))['defineNuxtRouteMiddleware']
  export const navigateTo: (typeof import('nuxt/app'))['navigateTo']
  export const useCookie: (typeof import('nuxt/app'))['useCookie']
}
