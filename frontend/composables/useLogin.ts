import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { loginService } from '~/services/login'

export const useLogin = () => {
  // State
  const { isAuthenticated, isAdmin } = useAuth()

  // Actions
  const login = async (email: string, password: string) => {
    try {
      const response = await loginService.login({
        email,
        password,
        rememberMe: false,
      })
      console.log('useLogin', response)

      isAuthenticated.value = true
      isAdmin.value = response.user.admin

      return { success: true, isAdmin: response.user.admin }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false }
    }
  }

  const logout = async () => {
    isAuthenticated.value = false
    isAdmin.value = false
  }

  // Computed properties
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
