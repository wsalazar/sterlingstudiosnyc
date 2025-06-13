<template>
  <div class="min-h-screen bg-grey-100">
    <main class="container mx-auto px-4 py-8">
      <div
        class="flex flex-col justify-center py-12 sm:px-6 lg:px-8 justify-center items-center"
      >
        <h1 class="text-4xl font-bold text-gray-900">
          <img
            src="/assets/images/Logo_Final2022.jpg"
            alt="Sterling Studios NYC Logo"
            width="200px"
            height="200px"
          />
        </h1>
      </div>
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div
          v-if="errorMessage"
          class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
        >
          {{ errorMessage }}
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{
            activeTab === 'login'
              ? 'Sign in to your account'
              : 'Create your account'
          }}
        </h2>
        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="flex border-b border-gray-200 mb-8">
            <button
              @click="activeTab = 'login'"
              :class="[
                'flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm',
                activeTab === 'login'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              Sign In
            </button>
          </div>

          <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form
              v-if="activeTab === 'login'"
              class="space-y-6"
              @submit.prevent="handleLogin"
            >
              <div>
                <label
                  for="login-email"
                  class="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div class="mt-1">
                  <input
                    id="login-email"
                    v-model="loginForm.email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  for="login-password"
                  class="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div class="mt-1">
                  <input
                    id="login-password"
                    v-model="loginForm.password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input
                    id="remember-me"
                    v-model="loginForm.rememberMe"
                    name="remember-me"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    for="remember-me"
                    class="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div class="text-sm">
                  <a
                    href="#"
                    class="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { loginService } from '../../services/login'

const activeTab = ref('login')
const errorMessage = ref('')
const isLoading = ref(false)

const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false,
})

const handleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    await loginService.login(loginForm.value)
    await loginService.directToDashboard('/admin/dashboard')
  } catch (error) {
    console.error('Login failed:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Login failed'
  } finally {
    isLoading.value = false
  }
}
</script>
