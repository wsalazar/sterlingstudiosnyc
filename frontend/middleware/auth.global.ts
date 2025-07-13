import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  // const {
  //   validateUser,
  //   isAuthenticated,
  //   isInitialized,
  //   isLoading,
  //   isInitializing,
  // } = useAuth()

  const { userData, loading } = useAuth()

  if (process.client) {
    while (loading.value) {
      await new Promise((r) => setTimeout(r, 50))
    }

    if (!userData.value) {
      return navigateTo('/admin/auth')
    }
  }

  // // Always validate user on route changes (including page loads/refreshes)
  // if (!isInitialized.value || isLoading.value || isInitializing.value) {
  //   await validateUser()
  // }

  // // Handle auth pages (login pages)
  // if (to.path === '/auth' || to.path === '/admin/auth') {
  //   if (isAuthenticated.value) {
  //     return navigateTo('/gallery')
  //   }
  //   return // Allow access to auth pages
  // }

  // // Handle protected pages
  // if (!isAuthenticated.value) {
  //   return navigateTo('/admin/auth')
  // }
})
