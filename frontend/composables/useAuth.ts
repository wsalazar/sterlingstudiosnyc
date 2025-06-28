import { auth } from '@/services/api'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * @todo use pinia for this stuff instead of local storage
 * @param key
 * @param defaultValue
 * @returns
 */

const useLocalStorage = (key: string, defaultValue: boolean) => {
  const state = ref(defaultValue)

  if (process.client) {
    const stored = localStorage.getItem(key)
    state.value = stored === 'true'
  }

  watch(state, (newValue) => {
    if (process.client) {
      localStorage.setItem(key, String(newValue))
    }
  })

  return {
    get value(): boolean {
      return state.value
    },
    set value(value: boolean) {
      state.value = value
    },
  }
}

const isAuthenticated = ref(false)
const isAdmin = ref(false)
const isLoading = ref(true)
const isInitialized = ref(false)
let initPromise: Promise<void> | null = null

export function useAuth() {
  const userStore = useUserStore()

  async function validateUser() {
    if (initPromise) {
      return initPromise
    }

    if (isInitialized.value && isAuthenticated.value) {
      return
    }

    initPromise = (async () => {
      if (!isLoading.value) {
        isLoading.value = true
      }

      try {
        const userData = await auth.validate()

        if (userData && userData.email) {
          isAuthenticated.value = true
          isAdmin.value = userData.admin
          userStore.setUserName(userData.name)
        } else {
          isAuthenticated.value = false
          isAdmin.value = false
          userStore.clearUserName()
        }
      } catch (error) {
        isAuthenticated.value = false
        isAdmin.value = false
        userStore.clearUserName()
      } finally {
        isLoading.value = false
        isInitialized.value = true
      }
    })()

    return initPromise
  }

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    isInitialized,
    validateUser,
  }
}
