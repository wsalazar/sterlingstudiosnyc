export default defineNuxtPlugin(async () => {
  const { validateUser, isAuthenticated } = useAuth()

  await validateUser()

  const route = useRoute()

  if (route.path === '/auth' || route.path === '/admin/auth') {
    if (isAuthenticated.value === true) {
      await navigateTo('/')
    }
  }
})
