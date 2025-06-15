<template>
  <div class="relative inline-block text-left">
    <button
      @click="isOpen = !isOpen"
      class="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div
        class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white"
      >
        {{ user ? user[0].toUpperCase() : '' }}
      </div>
      <span>{{ user || 'Guest' }}</span>
      <svg
        class="h-4 w-4 transition-transform durat-bottom-1"
        :class="{ 'rotation-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
    <div class="py-1">
      <a href=/profile 
          class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
          Profile
        </a>
        <div class="my-1 border-t border-gray-100"></div>
        <button
          @click="logout"
          class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
    </div>
  </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {navigateTo} from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated, isAdmin } = useAuth()

const user = ref('')
const isOpen = ref<Boolean>(false)

onMounted(() => {
  /**
   * This ensure that localStorage only happens on the client side.
   * I was getting a Hydration completed but contains mismatches error in the console
   */
  user.value = localStorage.getItem('name') ?? ''
})

const logout = () => {
  let userIsAdmin = false;
  if(isAdmin.value == true) {
    userIsAdmin = true;
  }
  localStorage.removeItem('name')
  isAuthenticated.value = false;
  isAdmin.value = false;
  
  user.value = ''
  isOpen.value = false
  navigateTo(userIsAdmin ? 'admin/auth' : 'auth')
}
</script>

<style scoped></style>
