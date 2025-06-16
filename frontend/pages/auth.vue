<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <div class="w-full max-w-md px-4 py-8">
      <div class="flex flex-col items-center justify-center py-12">
        <h1 class="text-4xl font-bold text-gray-900">
          <img
            src="/images/Logo_Final2022.jpg"
            alt="Sterling Studios NYC Logo"
            width="200"
            height="200"
            class="w-[200px] h-[200px] object-contain"
          />
        </h1>
      </div>

      <div
        v-if="errorMessage"
        class="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded"
      >
        {{ errorMessage }}
      </div>
      <h2 class="mt-6 text-3xl font-extrabold text-center text-gray-900">
        {{
          activeTab === 'login'
            ? 'Sign in to your account'
            : 'Create your account'
        }}
      </h2>
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex mb-8 border-b border-gray-200">
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
          <button
            @click="activeTab = 'register'"
            :class="[
              'flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm',
              activeTab === 'register'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            Register
          </button>
        </div>

        <div class="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
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
                  class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label
                  for="remember-me"
                  class="block ml-2 text-sm text-gray-900"
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
                class="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>

          <!-- Registration Form -->
          <form v-else class="space-y-6" @submit.prevent="handleRegister">
            <div>
              <label
                for="register-name"
                class="block text-sm font-medium text-gray-700"
              >
                Full name
              </label>
              <div class="mt-1">
                <input
                  id="register-name"
                  v-model="registerForm.name"
                  name="name"
                  type="text"
                  autocomplete="name"
                  required
                  class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                for="register-email"
                class="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div class="mt-1">
                <input
                  id="register-email"
                  v-model="registerForm.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                for="register-password"
                class="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div class="mt-1">
                <input
                  id="register-password"
                  v-model="registerForm.password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  required
                  minlength="10"
                  class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                for="register-confirm-password"
                class="block text-sm font-medium text-gray-700"
              >
                Confirm password
              </label>
              <div class="mt-1">
                <input
                  id="register-confirm-password"
                  v-model="registerForm.confirmPassword"
                  name="confirm-password"
                  type="password"
                  autocomplete="new-password"
                  minlength="10"
                  required
                  class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                class="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userApi } from '~/services/api'
import { useLogin } from '~/composables/useLogin'
import { navigateTo } from '#imports'

const activeTab = ref('login')
const errorMessage = ref('')
const isLoading = ref(false)
const { login } = useLogin()

const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false,
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const handleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const response = await login(
      loginForm.value.email,
      loginForm.value.password
    )
    console.log('Login response:', response)

    if (response.success) {
      // Ensure token is set
      const token = localStorage.getItem('access_token')
      console.log('Token after login:', token)

      if (!token) {
        throw new Error('Login failed - no token received')
      }

      await navigateTo('/')
    } else {
      throw new Error('Login failed')
    }
  } catch (error) {
    console.error('Login failed:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Login failed'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      errorMessage.value = 'Passwords do not match'
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    const userData = {
      name: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
    }
    console.log(userData)
    const response = await userApi.createUser(userData)
    console.log('User created successfully:', response)

    // Clear the form
    registerForm.value = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }

    // Switch to login tab
    activeTab.value = 'login'
  } catch (error) {
    console.error('Registration failed:', error)
    errorMessage.value =
      error instanceof Error ? error.message : 'Registration failed'
  } finally {
    isLoading.value = false
  }
}

definePageMeta({
  layout: 'auth',
})
</script>
