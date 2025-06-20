<template>
  <div class="inline-block relative text-left">
    <button
      @click="isOpen = !isOpen"
      class="inline-flex gap-2 items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div
        class="flex justify-center items-center w-8 h-8 text-sm font-bold text-white bg-blue-500 rounded-full"
      >
        {{ user ? user[0].toUpperCase() : '' }}
      </div>
      <span>{{ user || 'Guest' }}</span>
      <svg
        class="w-4 h-4 transition-transform durat-bottom-1"
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
      class="absolute right-0 mt-2 w-56 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none"
    >
    <div class="py-1">
      <a href=/profile 
          class="flex gap-2 items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
          Profile
        </a>
        <div class="my-1 border-t border-gray-100"></div>
        <button
          @click="logout"
          class="flex gap-2 items-center px-4 py-2 w-full text-sm text-red-600 hover:bg-gray-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
import { useUserStore } from '@/stores/user'

const { isAuthenticated, isAdmin } = useAuth()


const user = ref('')
const isOpen = ref<Boolean>(false)

onMounted(() => {
  const userStore = useUserStore()
  console.log(userStore.getUserName)
  user.value = userStore.getUserName
})

const logout = () => {
  let userIsAdmin = false;
  if(isAdmin.value == true) {
    userIsAdmin = true;
  }
  
    // localStorage.removeItem('name')

  // userStore.clearUserName()
  isAuthenticated.value = false;
  isAdmin.value = false;
  
  user.value = ''
  isOpen.value = false
  navigateTo(userIsAdmin ? 'admin/auth' : 'auth')
}
</script>

<style scoped></style>
