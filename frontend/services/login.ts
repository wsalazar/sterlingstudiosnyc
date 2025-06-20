import { authApi } from './api'
import { navigateTo } from '#imports'

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

export const loginService = {
  async login(form: LoginForm) {
    try {
      const response = await authApi.login({
        email: form.email,
        password: form.password,
      })
      form.email = ''
      form.password = ''
      form.rememberMe = false
      return response
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unknown error occurred')
    }
  },
  async directToDashboard(uri: string) {
    await navigateTo(uri)
  },
}
