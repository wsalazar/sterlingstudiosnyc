import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { isInitialized, validateUser } = useAuth()

  if (!isInitialized.value) {
    await validateUser()
  }
})
