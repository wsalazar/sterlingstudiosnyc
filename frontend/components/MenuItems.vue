<template>
  <nav class="m-4">
    <NuxtLink
      to="/gallery"
      class="block px-4 py-2 rounded-md transition-colors duration-200 hover:bg-black"
      :class="{ 'bg-black text-amber-500': route.path === '/gallery' }"
    >
      Gallery
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
<style scoped></style>
