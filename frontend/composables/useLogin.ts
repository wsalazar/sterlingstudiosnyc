import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { loginService } from '~/services/login'
import { navigateTo } from '#imports'

export const useLogin = () => {
  // State
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  // Actions
  const login = async (email: string, password: string) => {
    try {
      const response = await loginService.login({
        email,
        password,
        rememberMe: false,
      })
      console.log('Login response:', response)

      if (response.success) {
        isAuthenticated.value = true
        isAdmin.value = response.user.admin
        return { success: true, isAdmin: response.user.admin }
      }
      return { success: false }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false }
    }
  }

  const logout = async () => {
    if (isLoading) isLoading.value = true

    isAuthenticated.value = false
    isAdmin.value = false

    if (process.client) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('name')
    }

    await navigateTo('/auth')

    if (isLoading) {
      isLoading.value = false
    }
  }

  const isLoggedIn = computed(() => isAuthenticated.value === true)
  const isUserAdmin = computed(() => isAdmin.value === true)

  return {
    // State
    isLoggedIn,
    isUserAdmin,

    // Actions
    login,
    logout,
  }
}
