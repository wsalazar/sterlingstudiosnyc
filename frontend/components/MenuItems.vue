<template>
  <nav class="m-4">
    <NuxtLink
      to="/gallery"
      class="block px-4 py-2 text-amber-500 hover:bg-black rounded-md transition-colors duration-200"
      :class="{ 'bg-black': route.path === '/gallery' }"
    >
      Gallery
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.router-link-active {
  background-color: black;
  color: rgb(245 158 11);
}
</style>
