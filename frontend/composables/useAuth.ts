import { auth } from '@/services/api'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

// Add user data type interface
interface UserData {
  email: string
  name: string
  admin: boolean
  success: boolean
}

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
const isInitializing = ref(true) // New state to prevent flicker
let initPromise: Promise<void> | null = null

export function useAuth() {
  const userStore = useUserStore()
  const userData = useState<UserData | null>('user', () => null)
  const loading = useState('auth-loading', () => true)

  const initializeAuth = async () => {
    userData.value = await auth.validate()
    console.log('auth.validate() response:', userData)

    if (userData.value && userData.value.email) {
      console.log('User authenticated, setting state')
      isAuthenticated.value = true
      isAdmin.value = userData.value.admin
      userStore.setUserName(userData.value.name)
      loading.value = true
    } else {
      console.log('No user data, clearing state')
      isAuthenticated.value = false
      isAdmin.value = false
      loading.value = false
      userStore.clearUserName()
    }
  }

  return { userData, loading, initializeAuth }

  // async function validateUser() {
  //   console.log('=== validateUser called ===')
  //   console.log('Current state:', {
  //     isInitialized: isInitialized.value,
  //     isAuthenticated: isAuthenticated.value,
  //     isLoading: isLoading.value,
  //     isInitializing: isInitializing.value,
  //   })

  //   // Reset promise if we need to re-validate
  //   if (!isInitialized.value || !isAuthenticated.value) {
  //     console.log('Resetting initPromise')
  //     initPromise = null
  //   }

  //   if (initPromise) {
  //     console.log('Using existing promise')
  //     return await initPromise
  //   }

  //   // Only skip validation if we're both initialized AND authenticated
  //   if (isInitialized.value && isAuthenticated.value) {
  //     console.log('Skipping validation - already initialized and authenticated')
  //     return
  //   }

  //   console.log('Creating new validation promise')
  //   initPromise = (async () => {
  //     if (!isLoading.value) {
  //       isLoading.value = true
  //       console.log('Setting loading to true')
  //     }

  //     try {
  //       console.log('Calling auth.validate()...')
  // const userData = await auth.validate()
  // console.log('auth.validate() response:', userData)

  // if (userData && userData.email) {
  //   console.log('User authenticated, setting state')
  //   isAuthenticated.value = true
  //   isAdmin.value = userData.admin
  //   userStore.setUserName(userData.name)
  // } else {
  //   console.log('No user data, clearing state')
  //   isAuthenticated.value = false
  //   isAdmin.value = false
  //   userStore.clearUserName()
  // }
  //     } catch (error) {
  //       console.log('Error in validateUser:', error)
  //       console.log('Clearing authentication state due to error')
  //       isAuthenticated.value = false
  //       isAdmin.value = false
  //       userStore.clearUserName()
  //     } finally {
  //       isLoading.value = false
  //       isInitialized.value = true
  //       isInitializing.value = false // Mark initialization as complete
  //       console.log(
  //         'Validation complete - loading: false, initialized: true, initializing: false'
  //       )
  //     }
  //   })()

  //   console.log('Returning validation promise')
  //   return await initPromise
  // }

  // function resetAuth() {
  //   isAuthenticated.value = false
  //   isAdmin.value = false
  //   isInitialized.value = false
  //   isInitializing.value = true
  //   initPromise = null
  //   userStore.clearUserName()
  // }

  // return {
  //   isAuthenticated,
  //   isAdmin,
  //   isLoading,
  //   isInitialized,
  //   isInitializing,
  //   validateUser,
  //   resetAuth,
  // }
}
