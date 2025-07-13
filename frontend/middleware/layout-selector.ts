export default defineNuxtRouteMiddleware((to) => {
  // const { isAdmin, isAuthenticated, isInitialized } = useAuth()
  // console.log('=== Layout Selector Middleware ===')
  // console.log('Navigating to:', to.path)
  // console.log('Auth state:', {
  //   isAdmin: isAdmin.value,
  //   isAuthenticated: isAuthenticated.value,
  //   isInitialized: isInitialized.value,
  //   currentLayout: to.meta.layout,
  // })
  // // Only apply auth layouts to auth-related routes
  // if (to.path === '/auth' || to.path === '/admin/auth') {
  //   to.meta.layout = isAdmin.value ? 'admin-auth' : 'auth'
  // } else {
  //   to.meta.layout = 'default'
  // }
  // console.log('Layout set to:', to.meta.layout)
})
