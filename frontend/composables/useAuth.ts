import { ref, watch } from 'vue'

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

export const useAuth = () => {
  const isAuthenticated = useLocalStorage('isAuthenticated', false)
  const isAdmin = useLocalStorage('isAdmin', false)
  const isLoading = ref(false)

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
  }
}
