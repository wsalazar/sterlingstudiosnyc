<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div
      class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
    ></div>
  </div>
  <div v-else class="min-h-screen flex">
    <Transition name="fade" mode="out-in">
      <div v-if="!isLoading" class="min-h-screen flex w-full">
        <aside v-if="isAdmin" class="w-64 bg-black text-white">
          <div class="p-4">
            <h1 class="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div class="justify-center items-center">
            <NuxtLink to="/">
              <img
                src="/assets/images/Logo_Final2022.jpg"
                alt="Sterling Studios NYC Logo"
                width="100px"
                height="100px"
              />
            </NuxtLink>
          </div>
          <MenuItems :isAdmin="isAdmin" />
        </aside>
        <aside v-else class="w-64 bg-black text-white">
          <div class="justify-center items-center">
            <NuxtLink to="/">
              <img
                src="/assets/images/Logo_Final2022.jpg"
                alt="Sterling Studios NYC Logo"
                width="100px"
                height="100px"
              />
            </NuxtLink>
          </div>
          <MenuItems :isAdmin="!isAdmin" />
        </aside>

        <div class="flex-1 flex flex-col">
          <header class="bg-white shadow-sm">
            <nav class="container mx-auto px-4 py-4">
              <div class="flex justify-end">
                <AccountMenu />
              </div>
            </nav>
          </header>

          <main class="flex-grow">
            <div class="container mx-auto px-4 py-8">
              <slot />
            </div>
          </main>
        </div>
      </div>
    </Transition>
  </div>
  <Footer />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { isAdmin: userIsAdmin, isLoading } = useAuth()

const isAdmin = computed(() => userIsAdmin.value === true)

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

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
