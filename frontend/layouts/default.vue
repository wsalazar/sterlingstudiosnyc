<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div
      class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
    ></div>
  </div>
  <div v-else class="min-h-screen flex">
    <aside v-if="isAdmin" class="w-64 bg-gray-900 text-white">
      <div class="p-4">
        <h1 class="text-xl font-bold">Admin Dashboard</h1>
      </div>
      <nav class="m-4">
        <NuxtLink
          to="/admin"
          class="block px-4 py-2 hover:bg-gray-800"
          :class="{ 'bg-gray-800': route.path === '/admin' }"
        >
        </NuxtLink>
      </nav>
    </aside>
    <aside v-else class="w-64 bg-gray-900 text-white">
      <div class="p-4">
        <h1 class="text-xl font-bold">Dashboard</h1>
      </div>
      <MenuItems />
    </aside>
    <header class="bg-white shadow-sm">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900">
            Sterling Studios NYC
          </NuxtLink>
          <div class="container mx-auto px-4 py-4">
            <AccountMenu />
          </div>
        </div>
      </nav>
    </header>
    <main class="flex-grow">
      <div class="container mx-auto px-4 py-8">
        <div class="text-lg font-semibold mb-4"></div>
      </div>
    </main>

    <!-- <main class="flex-grow">
      <slot />
    </main> -->
  </div>
  <Footer />
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isLoading = ref(true)
const isAdmin = computed(() => route.path.startsWith('/admin'))

/**
 * I don't need to do any imports because in nuxt.conf file
 * I'm auto-importing. So I just need to used it in nuxt will autoimport that for me.'
 */

onMounted(() => {
  // Small delay to ensure smooth transition
  setTimeout(() => {
    isLoading.value = false
  }, 100)
})
</script>
