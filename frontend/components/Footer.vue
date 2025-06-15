<template>
  <div class="footer-menu h-max">
    <footer class="py-4 text-black">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div
          class="flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <SocialMediaLinks />
          <div class="text-sm text-gray-500">
            © {{ new Date().getFullYear() }} Sterling Studios. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import SocialMediaLinks from './SocialMediaLinks.vue'
</script>
<style scoped>
.footer-menu {
  background-color: #2c3e50;
}
</style>
