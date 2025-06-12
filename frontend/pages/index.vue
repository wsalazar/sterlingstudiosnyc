<template>
  <div class="min-h-screen bg-gray-50">
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-gray-900 mb-6">
          Sterling Studios NYC
        </h1>
        <p class="text-lg text-gray-600 mb-8">
          Your premier destination for creative space in New York City.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-semibold mb-4">Book a Studio</h2>
            <p class="text-gray-600 mb-4">
              Find and book the perfect space for your next project.
            </p>
            <NuxtLink
              to="/admin"
              class="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Get Started
            </NuxtLink>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-semibold mb-4">About Us</h2>
            <p class="text-gray-600 mb-4">
              Learn more about our state-of-the-art facilities and services.
            </p>
            <NuxtLink
              to="/about"
              class="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Learn More
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})
</script>
