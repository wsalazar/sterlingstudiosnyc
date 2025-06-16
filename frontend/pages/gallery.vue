<template>
  <div class="p-4">
    <div v-if="userIsAdmin" class="p-4 mt-4 bg-gray-100">
      <a @click="renderForm = true" class="cursor-pointer">
        <font-awesome-icon
          :icon="['fas', 'plus']"
          class="w-5 h-5 text-gray-400"
        />
      </a>
      <DataTable :data="data" :columns="columns" />
    </div>
  </div>
  <div v-if="!userIsAdmin">non-admin</div>

  <div
    v-if="renderForm"
    class="fixed inset-0 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50"
  >
    <div
      class="relative p-5 mx-auto bg-white border rounded-md shadow-lg top-20 w-96"
    >
      <div class="mt-3">
        <h3 class="mb-4 text-lg font-medium leading-6 text-gray-900">
          Add New Gallery Item
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700"
              >Name</label
            >
            <input
              type="text"
              id="name"
              v-model="formData.name"
              class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label
              for="description"
              class="block text-sm font-medium text-gray-700"
              >Description</label
            >
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter description"
            ></textarea>
          </div>

          <div>
            <label for="images" class="block text-sm font-medium text-gray-700"
              >Images</label
            >
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              @change="handleImageUpload"
              class="block w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <!-- Preview selected files -->
            <div v-if="formData.images.length > 0" class="mt-2">
              <p class="mb-2 text-sm text-gray-500">Selected files:</p>
              <ul class="space-y-1">
                <li
                  v-for="(file, index) in formData.images"
                  :key="index"
                  class="flex items-center justify-between text-sm text-gray-600"
                >
                  <span class="truncate">{{ file.name }}</span>
                  <button
                    type="button"
                    @click="removeFile(index)"
                    class="text-red-500 hover:text-red-700"
                  >
                    <font-awesome-icon
                      :icon="['fas', 'times']"
                      class="w-4 h-4"
                    />
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div class="flex justify-end mt-5 space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isAdmin } = useAuth()
const userIsAdmin = isAdmin.value
const renderForm = ref(false)

import { requestApi } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(faPlus, faTimes)

interface TableData {
  id: number
  name: string
}

const data = ref<TableData[]>([])

interface FormData {
  name: string
  description: string
  images: File[]
}

const formData = ref<FormData>({
  name: '',
  description: '',
  images: [] as File[],
})

const closeModal = () => {
  renderForm.value = false
  formData.value.name = ''
  formData.value.description = ''
  formData.value.images = []
}
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const newFiles = Array.from(target.files)
    formData.value.images = [...formData.value.images, ...newFiles]
  }
}

const removeFile = (index: number) => {
  formData.value.images.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData.value)
    const response = await requestApi.uploadImage(formData.value)
    console.log('gallery response', response)
    // Reset form and close modal
    formData.value = {
      name: '',
      description: '',
      images: [],
    }
    renderForm.value = false
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
  },
]

// Use default layout
definePageMeta({
  layout: 'default',
})

console.log('Gallery page loaded, isAdmin:', isAdmin.value)
</script>

<style scoped></style>
