import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { isInitialized, validateUser, isAuthenticated, isAdmin, isLoading } =
    useAuth()
  console.log('isInitalized', isInitialized.value)
  console.log('isAuthenticated', isAuthenticated.value)
  console.log('to', to)
  console.log('fullpath', to.fullPath)

  if (!isInitialized.value) {
    await validateUser()
  }
})
