<template>
  <div class="footer-menu h-max">
    <footer class="py-4 text-black">
      <SocialMediaLinks />
      <div class="container mx-auto text-center">
        <p>&copy; 2025 Stream on Theme. All rights reserved.</p>
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
