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
        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form class="space-y-6" @submit.prevent="handleSubmit">
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
                    v-model="email"
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
                    v-model="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span v-if="isLoading">Loading...</span>
                  <span v-else>Sign in</span>
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
definePageMeta({
  layout: 'admin-auth',
})

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLogin } from '~/composables/useLogin'

const router = useRouter()
const { login } = useLogin()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    const response = await login(email.value, password.value)
    console.log('index', response)
    if (response.success && response.isAdmin) {
      console.log('isAdmin')
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Login failed:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Login failed'
  } finally {
    isLoading.value = false
  }
}
</script>
