<template>
  <div class="p-4">
    <div v-if="isAdmin" class="mt-4 p-4 bg-gray-100">Admin View</div>
    <div v-else class="mt-4 p-4 bg-gray-100">Non-Admin View</div>
  </div>
</template>

<script setup lang="ts">
const { isAdmin } = useAuth()
console.log('Gallery page loaded, isAdmin:', isAdmin.value)
</script>

<style scoped></style>
