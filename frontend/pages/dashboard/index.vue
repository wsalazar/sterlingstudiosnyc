<template>
  non-admin
  <MenuItems />
  <AccountMenu />
  <main>
    <Footer />
  </main>
</template>
<script setup lang="ts">
/**
 * I don't need to do any imports because in nuxt.conf file
 * I'm auto-importing. So I just need to used it in nuxt will autoimport that for me.'
 */
</script>

<style scoped>
main {
  flex: 1;
  position: relative;
  z-index: 1;
}
</style>
