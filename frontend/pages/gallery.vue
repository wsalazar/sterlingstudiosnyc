<template>
  <div class="p-4">
    <div v-if="userIsAdmin" class="p-4 mt-4 bg-gray-100">
      <a @click="openModal" class="cursor-pointer">
        <font-awesome-icon
          :icon="['fas', 'plus']"
          class="w-5 h-5 text-gray-400"
        />
      </a>
      <DataTable
        :data="transformedData"
        :columns="columns"
        @record-deleted="fetchGalleryData"
        @show-overlay="editImages"
        @update-cell="editCell"
      />
    </div>
  </div>
  <div v-if="!userIsAdmin">non-admin</div>

  <div
    v-if="renderForm"
    class="overflow-y-auto fixed inset-0 w-full h-full bg-gray-600 bg-opacity-50"
  >
    <div
      class="relative top-20 p-5 mx-auto w-96 bg-white rounded-md border shadow-lg"
    >
      <div class="mt-3">
        <h3 class="mb-4 text-lg font-medium leading-6 text-gray-900">
          {{ editMode ? 'Edit Gallery Item' : 'Add New Gallery Item' }}
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="editMode === false">
            <label for="name" class="block text-sm font-medium text-gray-700"
              >Name</label
            >
            <input
              type="text"
              required
              id="name"
              v-model="formData.name"
              class="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter name"
            />
          </div>
          <div v-if="editMode === false">
            <label for="name" class="block text-sm font-medium text-gray-700"
              >Subdirectory</label
            >
            <input
              type="text"
              id="subdirectory"
              v-model="formData.subdirectory"
              class="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter a subdirectory"
            />
          </div>

          <div v-if="editMode === false">
            <label
              for="description"
              class="block text-sm font-medium text-gray-700"
              >Description</label
            >
            <textarea
              id="description"
              v-model="formData.description"
              required
              rows="3"
              class="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              :required="editMode === false"
              accept="image/*"
              @change="handleImageUpload"
              class="block mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div v-if="editMode === true">
              <p class="mt-2 mb-2 text-sm font-bold text-gray-500">
                Gallery files:
              </p>
              <ul class="space-y-1">
                <li
                  v-for="(name, index) in imagesToEdit"
                  :key="index"
                  class="flex justify-between items-center text-sm text-gray-600"
                >
                  <span class="truncate">{{ name }}</span>
                  <button
                    type="button"
                    @click="removeGalleryFiles(index)"
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

            <div v-if="formData.images.length > 0" class="mt-2">
              <p class="mt-2 mb-2 text-sm font-bold text-gray-500">
                Selected files:
              </p>
              <ul class="space-y-1">
                <li
                  v-for="(file, index) in formData.images"
                  :key="index"
                  class="flex justify-between items-center text-sm text-gray-600"
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
              class="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md border border-transparent shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
const editMode = ref(false)
const imagesToEdit = ref<string[]>([])
const editUuId = ref('')

import { upload, gallery } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import { type ColumnDef } from '@tanstack/vue-table'

library.add(faPlus, faTimes)

const fetchGalleryData = async () => {
  try {
    const galleries = await gallery.get()
    data.value = galleries.data
    console.log(data.value)
  } catch (error) {
    console.error('Error fetching gallery:', error)
  }
}

onMounted(async () => {
  await fetchGalleryData()
})

const openModal = () => {
  console.log('test')
  renderForm.value = true
  editMode.value = false
}

const editCell = async (row: any, newValue: string, fieldName: string) => {
  console.log(row.original.id, newValue, fieldName)
  const data = {
    newValue,
    fieldName,
  }
  console.log(data)
  await gallery.patch(row.original.id, data)
  await fetchGalleryData()
}

const editImages = (row: any) => {
  editMode.value = true
  renderForm.value = true
  imagesToEdit.value = row.original.images.split(',')
  editUuId.value = row.original.id
}

interface TableData {
  id: number
  name: string
  description: string
  user: { name: string }
  createAt: string
  totalSize: number
  images: { imageName: string; url: string }[]
  bucketDirectory: string
}

const data = ref<TableData[]>([])

const transformedData = computed(() => {
  console.log(data.value)
  return data.value.map((item) => ({
    ...item,
    userDisplay: item.user?.name || 'No name',
    totalSize: `${(item.totalSize / (1024 * 1024)).toFixed(2)} MB`,
    images: item.images.map((image) => image.imageName).join(','),
    createAt: item.createAt
      ? new Date(item.createAt).toLocaleDateString()
      : 'No date',
  }))
})

interface FormData {
  name: string
  description: string
  images: File[]
  subdirectory: string
}

const formData = ref<FormData>({
  name: '',
  description: '',
  images: [] as File[],
  subdirectory: '',
})

const closeModal = () => {
  renderForm.value = false
  formData.value.name = ''
  formData.value.description = ''
  formData.value.images = []
  formData.value.subdirectory = ''
}
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const newFiles = Array.from(target.files)
    formData.value.images = [...formData.value.images, ...newFiles]
  }
}

const removeGalleryFiles = (index: number) => {
  imagesToEdit.value.splice(index, 1)
}

const removeFile = (index: number) => {
  formData.value.images.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    if (editMode.value) {
      const { images } = formData.value
      await upload.patchImage(editUuId.value, imagesToEdit.value, images)
    } else {
      await upload.image(formData.value)
    }

    // Reset form
    formData.value = {
      name: '',
      description: '',
      images: [],
      subdirectory: '',
    }
    renderForm.value = false

    await fetchGalleryData()
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}

const columns: ColumnDef<TableData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'user.name',
    header: 'User',
  },
  {
    accessorKey: 'images',
    header: 'Images',
  },
  {
    accessorKey: 'bucketDirectory',
    header: 'Subdirectory',
  },
  {
    accessorKey: 'totalSize',
    header: 'Gallery Space',
  },
  {
    accessorKey: 'createAt',
    header: 'Date Modified',
  },
  {
    accessorKey: 'delete',
    header: 'Delete',
  },
]

// Use default layout
definePageMeta({
  layout: 'default',
})

console.log('Gallery page loaded, isAdmin:', isAdmin.value)
</script>

<style scoped></style>
