import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, isAdmin } = useAuth()

  console.log('Auth state:', {
    isAuthenticated: {
      value: isAuthenticated.value,
      type: typeof isAuthenticated.value,
      isTrue: isAuthenticated.value === true,
    },
    isAdmin: {
      value: isAdmin.value,
      type: typeof isAdmin.value,
      isTrue: isAdmin.value === true,
    },
  })

  if (to.path === '/auth' || to.path === '/admin/auth') {
    if (isAuthenticated.value === true) {
      return navigateTo('/dashboard')
    }
    return
  }

  // Protect admin routes
  if (to.path.startsWith('/admin') && to.path !== '/admin/auth') {
    if (isAuthenticated.value !== true) {
      return navigateTo('/admin/auth')
    }
    return navigateTo('/dashboard')
  }

  if (!to.path.startsWith('/admin') && to.path !== '/auth') {
    if (isAdmin.value !== true && isAuthenticated.value !== true) {
      return navigateTo('/auth')
    }
  }
})
