<template>
  <div class="flex min-h-screen">
    <Transition name="fade" mode="out-in">
      <div class="flex w-full min-h-screen">
        <aside class="w-64 text-white bg-black">
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
              <div>
                <h1>User Gallery</h1>
                <p>User UUID: {{ uuid }}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Transition>
  </div>
  <Footer />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { gallery } from '../services/api'
const route = useRoute()
console.log(route.params.uuid)
const uuid = computed(() => route.params.uuid)
console.log('uuid', uuid.value)
const validatedToken = gallery.validateUserToken(
  Array.isArray(uuid.value) ? uuid.value[0] : uuid.value
)
</script>
