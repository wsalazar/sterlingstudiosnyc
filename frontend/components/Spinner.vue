<template>
  <div class="spinner"></div>
</template>

<style scoped>
.spinner {
  border: 4px solid #000000;
  border-top: 4px solid #f59e0b;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
  margin: auto;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
