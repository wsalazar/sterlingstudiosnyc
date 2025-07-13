export default defineNuxtPlugin(async () => {
  const { initializeAuth } = useAuth()

  // Initialize auth state on app startup
  await initializeAuth()
})
