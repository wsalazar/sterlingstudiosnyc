export default defineNuxtRouteMiddleware((to) => {
  const { isAdmin, isAuthenticated } = useAuth()
  console.log('Layout selector middleware running:', {
    path: to.path,
    isAdmin: isAdmin.value,
    currentLayout: to.meta.layout,
    fullRoute: to,
  })
  console.log(to)

  if (to.path === '/auth' || to.path === '/admin/auth') {
    to.meta.layout = isAdmin.value ? 'admin-auth' : 'auth'
  } else {
    to.meta.layout = 'default'
  }

  console.log('Layout set to:', {
    layout: to.meta.layout,
    fullMeta: to.meta,
  })
})
