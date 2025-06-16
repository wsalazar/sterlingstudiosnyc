import { ref, watch } from 'vue'

const useLocalStorage = (key: string, defaultValue: boolean) => {
  const state = ref(defaultValue)

  // Initialize from localStorage
  if (process.client) {
    const stored = localStorage.getItem(key)
    state.value = stored === 'true'
  }

  // Watch for changes and update localStorage
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
