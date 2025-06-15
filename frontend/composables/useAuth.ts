import { useCookie } from '#imports'
import { ref, watch } from 'vue'

const useBooleanCookie = (name: string, options?: { maxAge?: number }) => {
  const cookie = useCookie(name, { ...options, default: () => false })
  const state = ref(cookie.value === true)

  // Watch for cookie changes
  watch(
    () => cookie.value,
    (newValue) => {
      state.value = newValue === true
    }
  )

  // Watch for state changes
  watch(state, (newValue) => {
    cookie.value = newValue
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
  const isAuthenticated = useBooleanCookie('isAuthenticated', { maxAge: 86400 })
  const isAdmin = useBooleanCookie('isAdmin', { maxAge: 86400 })

  return {
    isAuthenticated,
    isAdmin,
  }
}
