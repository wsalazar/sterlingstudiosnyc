import { computed, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { loginService } from '~/services/login'
import { auth as authApi } from '~/services/api'
import { useUserStore } from '@/stores/user'

const isLoggingOut = ref(false)
const preservedUserName = ref('')

export const useLogin = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const userStore = useUserStore()

  const login = async (email: string, password: string) => {
    try {
      const response = await loginService.login({
        email,
        password,
        rememberMe: false,
      })
      console.log(response)
      if (response.data.success) {
        isAuthenticated.value = true
        isAdmin.value = response.data.user.admin
        userStore.setUserName(response.data.user.name)
        return {
          success: true,
          isAdmin: response.data.user.admin,
          user: response.data.user.name,
        }
      }
      return { success: false }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false }
    }
  }

  const logout = async () => {
    if (isLoading) isLoading.value = true

    try {
      await authApi.logout()
    } catch (error) {
      console.error('Backend logout failed:', error)
    }

    isAuthenticated.value = false
    isAdmin.value = false
    userStore.clearUserName()

    if (process.client) {
      localStorage.removeItem('sterling_session')
      localStorage.removeItem('name')
    }

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
    isLoggingOut,
    preservedUserName,

    // Actions
    login,
    logout,
  }
}
