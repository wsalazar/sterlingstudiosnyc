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
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div
          v-if="errorMessage"
          class="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded"
        >
          {{ errorMessage }}
        </div>
        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
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
                    v-model="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span v-if="isLoading">Loading...</span>
                  <span v-else>Sign in</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-auth',
})

import { ref } from 'vue'
import { useLogin } from '~/composables/useLogin'

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
    console.log(response)
    if (response.success) {
      await navigateTo('/')
    }
  } catch (error) {
    console.error('Login failed:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Login failed'
  } finally {
    isLoading.value = false
  }
}
</script>
