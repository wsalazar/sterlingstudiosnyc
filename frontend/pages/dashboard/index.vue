<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div
      class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
    ></div>
  </div>

  <div v-else class="min-h-screen flex flex-col">
    <div class="flex-grow">
      <div class="container mx-auto px-4 py-8">
        <div class="text-lg font-semibold mb-4">Dashboard</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({
  layout: 'default',
})

const isLoading = ref(true)

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

<style scoped>
main {
  flex: 1;
  position: relative;
  z-index: 1;
}
</style>
