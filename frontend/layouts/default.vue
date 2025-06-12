<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white shadow-sm">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900">
            Sterling Studios NYC
          </NuxtLink>
          <div class="space-x-4">
            <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900"
              >Book Now</NuxtLink
            >
            <NuxtLink to="/about" class="text-gray-600 hover:text-gray-900"
              >About</NuxtLink
            >
            <NuxtLink to="/auth" class="text-gray-600 hover:text-gray-900"
              >Login</NuxtLink
            >
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-gray-50 border-t">
      <div class="container mx-auto px-4 py-6">
        <p class="text-center text-gray-600">
          © {{ new Date().getFullYear() }} Sterling Studios NYC. All rights
          reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
