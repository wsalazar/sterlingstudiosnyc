<template>
  <div class="flex min-h-screen">
    <Transition name="fade" mode="out-in">
      <div class="flex w-full min-h-screen">
        <aside class="w-64 text-white bg-black">
          <div class="justify-center items-center">
            <NuxtLink to="/">
              <img
                src="/assets/images/Logo_Final2022.jpg"
                alt="Sterling Studios NYC Logo"
                width="100px"
                height="100px"
              />
            </NuxtLink>
          </div>
        </aside>

        <div class="flex flex-col flex-1">
          <header class="bg-white shadow-sm">
            <nav class="container px-4 py-4 mx-auto">
              <div class="flex justify-end">
                <AccountMenu />
              </div>
            </nav>
          </header>

          <main class="flex-grow">
            <div class="container px-4 py-8 mx-auto">
              <div v-if="displaySentEmail">
                You have been sent an email with a new token.
              </div>

              <div v-if="accessDenied">
                You do not have access to this platform.
              </div>
              <div v-if="showLinkForNewToken">
                You're viewing this page as a guest. To access your gallery,
                request a new link.
                <div class="flex gap-4 justify-start mt-6">
                  <button
                    class="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    @click="sendNewLink"
                  >
                    Request New Link
                  </button>
                </div>
              </div>
            </div>
            <div
              v-if="showOverlay"
              class="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50"
            >
              <div
                class="relative p-8 w-full max-w-md bg-white rounded-lg shadow-lg"
              >
                <slot name="overlay-content">
                  <h2 class="mb-4 text-lg font-bold">Expired Token</h2>
                  <p>To receive a new link click on Yes.</p>
                  <div class="flex gap-4 justify-end mt-6">
                    <button
                      class="px-4 py-2 text-white bg-red-600 rounded hover:bg-blue-700"
                      @click="cancelToken"
                    >
                      No
                    </button>
                    <button
                      class="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                      @click="sendNewLink"
                    >
                      Yes
                    </button>
                  </div>
                </slot>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Transition>
  </div>
  <Footer />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

import { gallery } from '../services/api'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/stores/user'

const showLinkForNewToken = ref(false)
const accessDenied = ref(false)
const displaySentEmail = ref(false)
const toast = useToast()
const route = useRoute()
const showOverlay = ref(false)
const uuid = computed(() => route.params.uuid)
try {
  const { isAuthenticated, isAdmin } = useAuth()

  const userStore = useUserStore()

  const response = await gallery.validateUserToken(
    Array.isArray(uuid.value) ? uuid.value[0] : uuid.value
  )
  isAdmin.value = false
  isAuthenticated.value = false
  userStore.clearUserName()
  if (response.data.data.success) {
    isAuthenticated.value = true
    isAdmin.value = response.data.data.user.admin
    userStore.setUserName(response.data.data.user.name)
    navigateTo('/gallery')
  }
} catch (error) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    (error as any).response?.status === 404
  ) {
    accessDenied.value = true
  }
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    (error as any).response?.status === 400
  ) {
    showOverlay.value = true
  }
}

const sendNewLink = async () => {
  try {
    const response = await gallery.sendNewLink(
      Array.isArray(uuid.value) ? uuid.value[0] : uuid.value
    )
    if (response.success) {
      showOverlay.value = false
      displaySentEmail.value = true
      toast.success(response.message)
    }
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message)
    } else {
      toast.error(String(error))
    }
  }
}

const cancelToken = () => {
  showOverlay.value = false
  showLinkForNewToken.value = true
}
</script>
