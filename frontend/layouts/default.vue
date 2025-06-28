<template>
  <div
    v-if="isLoading"
    class="flex fixed inset-0 z-50 justify-center items-center bg-white"
  >
    <div class="text-center">
      <div
        class="mx-auto w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"
      ></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>

  <div v-else class="flex min-h-screen">
    <Transition name="fade" mode="out-in">
      <div class="flex w-full min-h-screen">
        <aside v-if="isAdmin" class="w-64 text-white bg-black">
          <div class="p-4">
            <h1 class="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div class="justify-center items-center">
            <NuxtLink to="/">
              <img
                src="/images/Logo_Final2022.jpg"
                alt="Sterling Studios NYC Logo"
                width="100px"
                height="100px"
                class="w-[100px] h-[100px] object-contain"
              />
            </NuxtLink>
          </div>
          <MenuItems :isAdmin="isAdmin" />
        </aside>
        <aside v-else class="w-64 text-white bg-black">
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

        <div class="flex flex-col flex-1">
          <header class="bg-white shadow-sm">
            <nav class="container px-4 py-4 mx-auto">
              <div class="flex justify-end">
                <AccountMenu />
              </div>
            </nav>
          </header>

          <main class="flex-grow">
            <div class="container px-4 py-8 mx-auto">
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { isAdmin: userIsAdmin, isLoading } = useAuth()

const isAdmin = computed(() => userIsAdmin.value === true)
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
