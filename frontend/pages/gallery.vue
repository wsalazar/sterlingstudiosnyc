<template>
  <div class="p-4">
    <div v-if="userIsAdmin" class="p-4 mt-4 bg-gray-100">
      <a @click="openModal" class="cursor-pointer">
        <font-awesome-icon
          :icon="['fas', 'plus']"
          class="w-5 h-5 text-gray-400"
        />
      </a>
      <!-- <NuxtLifecycleDemo /> -->
      <DataTable
        :data="transformedData"
        :columns="columns"
        @record-deleted="fetchGalleryData"
        @show-overlay="editImages"
        @update-cell="editCell"
        @selected-client="selectedClient"
      />
    </div>
  </div>
  <div v-if="!userIsAdmin">non-admin</div>
  <Spinner v-if="isLoading" />

  <div
    v-if="showOverlay"
    class="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50"
  >
    <div class="relative p-8 w-full max-w-md bg-white rounded-lg shadow-lg">
      <button
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        @click="closeOverlay"
      >
        &times;
      </button>
      <!-- Overlay Content Here -->
      <slot name="overlay-content">
        <h2 class="mb-4 text-lg font-bold">Client Selection Gallery</h2>
        <p>
          <span class="font-bold text-amber-500">{{ client }}</span> will be
          sent this gallery,
          <span class="font-bold text-amber-500">{{ galleryName }}</span
          >.
        </p>
        <p>Are you sure?</p>
        <div class="flex gap-4 justify-end mt-6">
          <button
            class="px-4 py-2 text-white bg-red-600 rounded hover:bg-blue-700"
            @click="closeOverlay"
          >
            No
          </button>
          <button
            class="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            @click="closeOverlay"
          >
            Yes
          </button>
        </div>
      </slot>
    </div>
  </div>

  <div
    v-if="renderForm && !isLoading"
    class="overflow-y-auto fixed inset-0 w-full h-full bg-gray-600 bg-opacity-50"
  >
    <div
      class="relative top-20 p-5 mx-auto w-[50rem] bg-white rounded-md border shadow-lg"
    >
      <div class="mt-3">
        <h3 class="mb-4 text-lg font-medium leading-6 text-gray-900">
          {{ galleryOverlayTitle }}
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
              placeholder="Enter a subdirectory ie: TestDirectory/Subdirectory"
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
            <div class="inline-block relative">
              <input
                type="file"
                id="images"
                multiple
                :required="editMode === false"
                accept="image/*"
                @change="handleImageUpload"
                class="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
              />
              <label
                for="images"
                class="block px-4 py-2 font-semibold text-blue-700 bg-blue-50 rounded-md cursor-pointer"
                >Choose files</label
              >
              <span
                class="absolute top-0 left-0 w-[11rem] px-6 py-2 text-sm text-gray-600 pointer-events-none ml-[120px]"
                >{{ formData.images.length }} files selected</span
              >
            </div>
            <div v-if="editMode === true">
              <p class="mt-2 mb-2 text-sm font-bold text-gray-500">
                Gallery files:
              </p>
              <ul class="space-y-1">
                <li
                  v-for="(imageObj, index) in imagesToEdit"
                  :key="index"
                  :data-image-id="imageObj.id"
                  class="flex gap-2 text-sm text-gray-600"
                >
                  <span
                    v-if="!(isImageNameEditable && imageObj.id === imageId)"
                    class="w-[15rem] truncate"
                    @click="editImageName(imageObj)"
                    >{{ `${imageObj.imageName}` }}</span
                  >
                  <input
                    v-else
                    class="rounded-md border-none outline-none w-[15rem] p-0 focus:ring-0"
                    type="text"
                    v-model="newImageName"
                    @keydown.enter.prevent="onEnterImageName(index)"
                    @keyup.esc="cancelImage"
                  />
                  <span
                    class="truncate"
                    v-if="!(isPriceEditable && imageObj.id === imageId)"
                    @click="editPrice(imageObj)"
                    >{{ imageObj.price }}</span
                  >
                  <input
                    v-else
                    class="p-0 rounded-md border-none outline-none focus:ring-0 w-[4.5rem]"
                    type="number"
                    v-model="newPrice"
                    @keydown.enter.prevent="onEnterPrice(index)"
                    @keyup.esc="cancelImage"
                  />
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
                  <span class="truncate">{{ `${file.name}` }}</span>

                  <div>
                    <input
                      type="text"
                      id="newFile"
                      v-model="formData.newFile[index]"
                      class="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Rename this file"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      id="price"
                      v-model="formData.price[index]"
                      class="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Price"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

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
const imagesToEdit = ref<{ imageName: string; price: string; id: string }[]>([])
const removedImages = ref<{ imageName: string; price: string; id: string }[]>(
  []
)
const isLoading = ref(false)
const galleryName = ref<string>('')
const client = ref<string>('')
const editUuId = ref('')
const subdirectory = ref('')
const newImageName = ref('')
const newPrice = ref<number>(0)
const imageId = ref('')
const isImageNameEditable = ref(false)
const isPriceEditable = ref(false)
const galleryHasBeenEdited = ref(false)
const showOverlay = ref(false)
const hasChanges = ref<{ imageName?: string; price?: string; id: string }[]>([])

import { upload, gallery } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import { type ColumnDef } from '@tanstack/vue-table'
import { useToast } from 'vue-toastification'
import Spinner from '@/components/Spinner.vue'
const toast = useToast()

library.add(faPlus, faTimes)

const galleryOverlayTitle = computed(() =>
  editMode.value
    ? `Edit Gallery Item - ${subdirectory.value}`
    : 'Add New Gallery Item'
)

const editPrice = (imageObj: { id: string; price: string }) => {
  isPriceEditable.value = true
  galleryHasBeenEdited.value = true
  imageId.value = imageObj.id
  newPrice.value = Number(imageObj.price.replace('$', ''))
}

const editImageName = (imageObj: { id: string; imageName: string }) => {
  isImageNameEditable.value = true
  imageId.value = imageObj.id
  newImageName.value = imageObj.imageName
  galleryHasBeenEdited.value = true
}

const onEnterPrice = (index: number) => {
  if (imagesToEdit.value[index].price !== newImageName.value) {
    imagesToEdit.value[index].price = String(`$${newPrice.value.toFixed(2)}`)
    const { id, price } = imagesToEdit.value[index]
    const existingIndex = hasChanges.value.findIndex((item) => item.id === id)
    if (existingIndex >= 0) {
      hasChanges.value[existingIndex] = {
        ...hasChanges.value[existingIndex],
        price,
      }
    } else {
      hasChanges.value.push({ id, price })
    }
  }
  isPriceEditable.value = false
  imageId.value = ''
  newPrice.value = 0
}

const onEnterImageName = (index: number) => {
  if (imagesToEdit.value[index].imageName !== newImageName.value) {
    imagesToEdit.value[index].imageName = newImageName.value
    const { id, imageName } = imagesToEdit.value[index]
    const existingIndex = hasChanges.value.findIndex((item) => item.id === id)
    if (existingIndex >= 0) {
      hasChanges.value[existingIndex] = {
        ...hasChanges.value[existingIndex],
        imageName,
      }
    } else {
      hasChanges.value.push({ id, imageName })
    }
  }
  isImageNameEditable.value = false
  imageId.value = ''
  newImageName.value = ''
}

const cancelImage = () => {
  isImageNameEditable.value = false
  isPriceEditable.value = false
  galleryHasBeenEdited.value = false
  imageId.value = ''
  newImageName.value = ''
  newPrice.value = 0
}

const fetchGalleryData = async () => {
  try {
    const galleries = await gallery.get()
    data.value = galleries.data
  } catch (error) {
    console.error('Error fetching gallery:', error)
  }
}

onMounted(async () => {
  await fetchGalleryData()
})

const openModal = () => {
  renderForm.value = true
  editMode.value = false
}

const closeOverlay = () => {
  showOverlay.value = false
}

const selectedClient = (
  row: any,
  clientSelected: { code: string; name: string }
) => {
  galleryName.value = row.original.name
  client.value = clientSelected.name
  showOverlay.value = true
}

const editCell = async (row: any, newValue: string, fieldName: string) => {
  const data = {
    newValue,
    fieldName,
  }
  await gallery.patch(row.original.id, data)
  await fetchGalleryData()
}

const editImages = (row: any) => {
  editMode.value = true
  renderForm.value = true
  imagesToEdit.value = row.original.images.map((image: any) => ({
    imageName: image.imageName,
    price: `$${image.price.toFixed(2)}`,
    id: image.id,
  }))
  subdirectory.value = row.original.bucketDirectory
  editUuId.value = row.original.id
}

interface TableData {
  id: number
  name: string
  description: string
  user: { name: string }
  updatedAt: string
  totalSize: number
  clients: [{ id: string; name: string }]
  images: { imageName: string; price: number; id: string }[]
  bucketDirectory: string // change this to bucektSubdirectory
}

const data = ref<TableData[]>([])

const transformedData = computed(() => {
  console.log(data.value)
  return data.value.map((item) => ({
    ...item,
    userDisplay: item.user?.name || 'No name',
    totalSize: `${(item.totalSize / (1024 * 1024)).toFixed(2)} MB`,
    images: item.images.map((image) => ({
      imageName: image.imageName,
      price: image.price,
      id: image.id,
    })),
    clients: item.clients.map((client) => ({
      name: client.name,
      code: client.id,
    })),
    updatedAt: item.updatedAt
      ? new Date(item.updatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'No date',
  }))
})

interface FormData {
  name: string
  description: string
  images: File[]
  subdirectory: string
  newFile: string[]
  price: string[]
}

const formData = ref<FormData>({
  name: '',
  description: '',
  images: [] as File[],
  subdirectory: '',
  newFile: [] as string[],
  price: [] as string[],
})

const closeModal = () => {
  renderForm.value = false
  formData.value.name = ''
  formData.value.description = ''
  formData.value.images = []
  formData.value.subdirectory = ''
  formData.value.newFile = []
  formData.value.price = []
}
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const newFiles = Array.from(target.files)
    formData.value.images = [...formData.value.images, ...newFiles]
  }
}

const removeGalleryFiles = (index: number) => {
  const removed = imagesToEdit.value[index]
  if (removed) {
    removedImages.value.push(removed)
    imagesToEdit.value.splice(index, 1)
  }
}

const removeFile = (index: number) => {
  formData.value.images.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    if (editMode.value) {
      const { images, price, newFile } = formData.value
      const newRenamedFiles = [...newFile]

      const existingImages = imagesToEdit.value.map(
        (editedImage) => editedImage.imageName
      )

      const selectedImages = images.map(
        (image, index) => newRenamedFiles[index] || image.name
      )

      const uniqueImages = [...new Set(existingImages)]
      if (uniqueImages.length !== existingImages.length) {
        toast.error('You have a non-unique image name as a gallery image!')
        isLoading.value = false
        return
      }

      const uniqueSelectedImages = [...new Set(selectedImages)]
      if (selectedImages.length !== uniqueSelectedImages.length) {
        toast.error('You have a non-unique image name as a selected image!')
        isLoading.value = false
        return
      }

      const combinedImageNames = [...existingImages, ...selectedImages]
      const uniqueCombinedImages = [...new Set(combinedImageNames)]
      if (combinedImageNames.length !== uniqueCombinedImages.length) {
        toast.error('You have a non-unique image name!')
        isLoading.value = false
        return
      }

      const payload = {
        id: editUuId.value,
        imagesToEdit: hasChanges.value ?? [],
        images: images,
        price: price,
        newFile: newFile,
        removedImages: removedImages.value,
      }
      await upload.patchImage(payload)
    } else {
      await upload.image(formData.value)
    }
    formData.value = {
      name: '',
      description: '',
      images: [],
      subdirectory: '',
      newFile: [],
      price: [],
    }
    removedImages.value = []
    renderForm.value = false
    hasChanges.value = []
    isLoading.value = false

    await fetchGalleryData()
    if (editMode.value) {
      toast.success('Successfully edited a Gallery!')
    } else {
      toast.success('Successfully created a Gallery!')
    }
  } catch (error) {
    /**
     *
     * @todo if it failes i need to renderForm false
     * @todo removedImages to []
     * @todo hasChanges to []
     * @todo some kind of thing that tells the admin something went wrong with
     * logs
     * */
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
    accessorKey: 'updatedAt',
    header: 'Date Modified',
  },
  {
    accessorKey: 'clients',
    header: 'Client',
  },
  {
    accessorKey: 'delete',
    header: 'Delete',
  },
]

definePageMeta({
  layout: 'default',
})
</script>

<style scoped></style>
