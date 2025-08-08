<template>
  <div class="p-4">
    <div v-if="userIsAdmin" class="p-4 mt-4 bg-gray-100">
      <a @click="openModal" class="cursor-pointer">
        <font-awesome-icon
          :icon="['fas', 'plus']"
          class="w-5 h-5 text-[#f59e0b]"
        />
      </a>
      <!-- <NuxtLifecycleDemo /> -->
      <DataTable
        :data="transformedData"
        :columns="columns"
        @record-deleted="fetchGalleryData"
        @display-overlay="displayOverlay"
        @update-cell="editCell"
        @selected-client="selectedClient"
      />
    </div>
  </div>
  <Spinner v-if="isLoading" />

  <div v-if="!userIsAdmin" class="p-4 mt-4">
    <UserGallery :galleryData="galleryData" />
  </div>

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
            @click="sendClientGallery"
          >
            Yes
          </button>
        </div>
      </slot>
    </div>
  </div>

  <Transition name="backdrop" appear>
    <div
      v-if="renderOverlayForm && !isLoading"
      class="overflow-y-auto fixed inset-0 w-full h-full bg-gray-600 bg-opacity-50"
    >
      <Transition name="modal" appear>
        <Overlay
          :show="showOverlay"
          :editMode="editMode"
          :isBucketDirectoryEditable="isBucketDirectoryEditable"
          :isImageNameEditable="isImageNameEditable"
          :isPriceEditable="isPriceEditable"
          :galleryOverlayTitle="galleryOverlayTitle"
          :imagesToEdit="imagesToEdit"
          :formData="formData"
          :imageId="imageId"
          :newImageName="newImageName"
          :newBucketDirectory="newBucketDirectory"
          :newPrice="newPrice"
          @remove-file="removeFile"
          @close-modal="closeModal"
          @remove-gallery-files="removeGalleryFiles"
          @edit-price="editPrice"
          @on-enter-price="onEnterPrice"
          @on-enter-bucket-directory="onEnterBucketDirectory"
          @on-enter-image-name="onEnterImageName"
          @cancel-price="cancelPrice"
          @cancel-image="cancelImage"
          @cancel-bucket-directory="cancelBucketDirectory"
          @edit-image-name="editImageName"
          @edit-bucket-directory="editBucketDirectory"
          @handle-image-upload="handleImageUpload"
          @handle-submit="handleSubmit"
          @update:newImageName="(value: string) => newImageName = value"
          @update:newBucketDirectory="(value: string) => newBucketDirectory = value"
          @update:newPrice="(value: number) => newPrice = value"
        />
      </Transition>
      <!-- <div
      class="relative top-20 p-5 mx-auto w-[80rem] bg-white rounded-md border shadow-lg"
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
            <label
              for="clientDirectoryName"
              class="block text-sm font-medium text-gray-700"
              >Client Name</label
            >
            <input
              type="text"
              id="clientDirectoryName"
              required
              v-model="formData.clientDirectoryName"
              class="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter Client's name"
            />
          </div>
          <div v-if="editMode === false" class="flex">
            <input
              type="checkbox"
              id="event"
              v-model="formData.event"
              @change="!formData.event"
              class="block mt-1 mr-2 w-5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <label
              for="event"
              class="inline-block text-sm font-medium text-gray-700"
              >Same Event</label
            >
          </div>

          <div v-if="editMode === false && formData.event">
            <label
              for="clientEvent"
              class="block text-sm font-medium text-gray-700"
              >Event</label
            >
            <input
              type="text"
              id="clientEvent"
              v-model="formData.clientEvent"
              class="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter the Client's Event"
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
                  <div v-if="!formData.event">
                    <input
                      class="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      type="text"
                      v-model="formData.clientEvents[index]"
                      placeholder="Enter the Client's Event"
                    />
                  </div>
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
    </div> -->
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isAdmin } = useAuth()
const userIsAdmin = isAdmin.value
const renderOverlayForm = ref(false)
const editMode = ref(false)
const imagesToEdit = ref<
  {
    imageName: string
    price: string
    imageId: string
    bucket: string
    bucketId: string
  }[]
>([])
const removedImages = ref<
  { imageName: string; price: string; imageId: string; bucketId: string }[]
>([])
const isLoading = ref(false)
const galleryName = ref<string>('')
const galleryId = ref<string>('')
const client = ref<string>('')
const clientId = ref<string>('')
const editUuId = ref('')
const subdirectory = ref('')
const newImageName = ref('')
const newBucketDirectory = ref('')
const newPrice = ref<number>(0)
const imageId = ref('')
const isImageNameEditable = ref(false)
const isBucketDirectoryEditable = ref(false)
const isPriceEditable = ref(false)
const galleryHasBeenEdited = ref(false)
const showOverlay = ref(false)
const hasChanges = ref<
  {
    imageName?: string
    price?: string
    imageId: string
    bucket?: string
    bucketId?: string
  }[]
>([])

import { upload, gallery } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import { type ColumnDef } from '@tanstack/vue-table'
import { useToast } from 'vue-toastification'
import Spinner from '@/components/Spinner.vue'
import { getGalleryStore } from '../stores/gallery'
const galleryData = computed(() => getGalleryStore().getGallery)

const toast = useToast()

library.add(faPlus, faTimes)

const galleryOverlayTitle = computed(() =>
  editMode.value ? `Edit Gallery Item` : 'Add New Gallery Item'
)

const editPrice = (imageObj: { imageId: string; price: string }) => {
  console.log('gallery editPrice', imageObj)
  // Reset other editing states first
  isImageNameEditable.value = false
  isBucketDirectoryEditable.value = false
  // Set price editing state
  isPriceEditable.value = true
  galleryHasBeenEdited.value = true
  imageId.value = imageObj.imageId
  newPrice.value = Number(imageObj.price.replace('$', ''))
}

const editImageName = (imageObj: { imageId: string; imageName: string }) => {
  isPriceEditable.value = false
  isBucketDirectoryEditable.value = false
  isImageNameEditable.value = true
  imageId.value = imageObj.imageId
  newImageName.value = imageObj.imageName
  galleryHasBeenEdited.value = true
}

const editBucketDirectory = (imageObj: { imageId: string; bucket: string }) => {
  isPriceEditable.value = false
  isImageNameEditable.value = false
  isBucketDirectoryEditable.value = true
  imageId.value = imageObj.imageId
  newBucketDirectory.value = imageObj.bucket
  galleryHasBeenEdited.value = true
}

const onEnterPrice = (
  newPriceValue: number,
  imageObj: { imageId: string; price: string }
) => {
  if (Number(imageObj.price).toFixed(2) !== newPriceValue.toFixed(2)) {
    imageObj.price = String(`$${newPriceValue.toFixed(2)}`)
    const { imageId, price } = imageObj
    const existingIndex = hasChanges.value.findIndex(
      (item) => item.imageId === imageId
    )
    if (existingIndex >= 0) {
      hasChanges.value[existingIndex] = {
        ...hasChanges.value[existingIndex],
        price,
      }
    } else {
      hasChanges.value.push({ imageId, price })
    }
  }
  isPriceEditable.value = false
  imageId.value = ''
  newPrice.value = 0
}

const onEnterBucketDirectory = (newValue: string, index: number) => {
  if (imagesToEdit.value[index].bucket !== newValue) {
    imagesToEdit.value[index].bucket = newValue
    const { imageId, bucket, bucketId } = imagesToEdit.value[index]
    const existingIndex = hasChanges.value.findIndex(
      (item) => item.imageId === imageId
    )
    if (existingIndex >= 0) {
      hasChanges.value[existingIndex] = {
        ...hasChanges.value[existingIndex],
        bucket,
        bucketId,
      }
    } else {
      hasChanges.value.push({ imageId, bucket, bucketId })
    }
  }
  isBucketDirectoryEditable.value = false
  imageId.value = ''
  newBucketDirectory.value = ''
}

const onEnterImageName = (newValue: string, index: number) => {
  if (imagesToEdit.value[index].imageName !== newValue) {
    imagesToEdit.value[index].imageName = newValue
    const { imageId, imageName, bucket, bucketId } = imagesToEdit.value[index]
    const existingIndex = hasChanges.value.findIndex(
      (item) => item.imageId === imageId
    )
    if (existingIndex >= 0) {
      hasChanges.value[existingIndex] = {
        ...hasChanges.value[existingIndex],
        imageName,
        bucket,
        bucketId,
      }
    } else {
      hasChanges.value.push({ imageId, imageName, bucket, bucketId })
    }
  }
  isImageNameEditable.value = false
  imageId.value = ''
  newImageName.value = ''
}

const cancelPrice = () => {
  isImageNameEditable.value = false
  isPriceEditable.value = false
  isBucketDirectoryEditable.value = false
  galleryHasBeenEdited.value = false
  imageId.value = ''
  newPrice.value = 0
  newBucketDirectory.value = ''
  newImageName.value = ''
}

const cancelImage = () => {
  isImageNameEditable.value = false
  isPriceEditable.value = false
  isBucketDirectoryEditable.value = false
  galleryHasBeenEdited.value = false
  imageId.value = ''
  newImageName.value = ''
  newBucketDirectory.value = ''
  newPrice.value = 0
}

const cancelBucketDirectory = () => {
  isImageNameEditable.value = false
  isPriceEditable.value = false
  isBucketDirectoryEditable.value = false
  galleryHasBeenEdited.value = false
  imageId.value = ''
  newBucketDirectory.value = ''
  newPrice.value = 0
  newImageName.value = ''
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
  if (userIsAdmin) {
    await fetchGalleryData()
  }
})

const openModal = () => {
  renderOverlayForm.value = true
  editMode.value = false
}

const closeOverlay = () => {
  showOverlay.value = false
}

const sendClientGallery = async () => {
  const payload = {
    clientId: clientId.value,
    galleryId: galleryId.value,
  }
  await gallery.assignUser(payload)
  await fetchGalleryData()
  closeOverlay()
  toast.success(
    `You have assigned ${client.value} the ${galleryName.value} gallery`
  )
}

const selectedClient = (
  row: any,
  clientSelected: { code: string; name: string }
) => {
  galleryName.value = row.original.name
  galleryId.value = row.original.id
  client.value = clientSelected.name
  clientId.value = clientSelected.code
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

const displayOverlay = (row: any, cellId: string) => {
  if (cellId === 'images') {
    editMode.value = true
    renderOverlayForm.value = true
    const directory = row.original.galleryBuckets.map((galleryBucket: any) => ({
      bucket: galleryBucket.bucketDirectory,
      id: galleryBucket.id,
    }))
    const client = directory
      .map((item: { bucket: string; id: string }) => {
        return item.bucket.substring(0, item.bucket.indexOf('/'))
      })
      .filter((item: string, index: number, self: string[]) => {
        return self.indexOf(item) === index
      })
      .pop()

    const subdirectories = directory.map(
      (item: { bucket: string; id: string }) => {
        return {
          bucket: item.bucket.substring(
            item.bucket.indexOf('/') + 1,
            item.bucket.length
          ),
        }
      }
    )

    imagesToEdit.value = row.original.images.map(
      (image: any, index: number) => {
        return {
          client: client,
          bucket: subdirectories[index].bucket,
          bucketId: directory[index].id,
          imageName: `${image.imageName}`,
          price: `$${image.price.toFixed(2)}`,
          imageId: image.id,
        }
      }
    )
    formData.value.event = true
    editUuId.value = row.original.id
  }
}

interface TableData {
  id: number
  name: string
  description: string
  user: { name: string }
  updatedAt: string
  totalSize: number
  clients: { id: string; name: string }[]
  accessTokens: { user: { id: string } }
  images: { imageName: string; price: number; id: string }[]
  bucketDirectory: string // change this to bucektSubdirectory
  userUuid: string
}

const data = ref<TableData[]>([])

const transformedData = computed(() => {
  return data.value.map((item) => ({
    ...item,
    userDisplay: item.user?.name || 'No name',
    totalSize: `${(item.totalSize / (1024 * 1024)).toFixed(2)} MB`,
    images: item.images.map((image) => ({
      imageName: image.imageName,
      price: image.price,
      id: image.id,
    })),
    client: item.accessTokens?.user?.id,
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
  clientDirectoryName: string
  newFile: string[]
  price: string[]
  event: boolean
  clientEvent: string
  clientEvents: string[]
}

const formData = ref<FormData>({
  name: '',
  description: '',
  images: [] as File[],
  clientDirectoryName: '',
  newFile: [] as string[],
  price: [] as string[],
  event: true,
  clientEvent: '',
  clientEvents: [] as string[],
})

const closeModal = () => {
  renderOverlayForm.value = false
  formData.value.name = ''
  formData.value.description = ''
  formData.value.images = []
  formData.value.clientDirectoryName = ''
  formData.value.newFile = []
  formData.value.price = []
  formData.value.event = true
  formData.value.clientEvent = ''
  formData.value.clientEvents = []
}
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const newFiles = Array.from(target.files)
    formData.value.images = [...formData.value.images, ...newFiles]
  }
}

const removeGalleryFiles = (imageToRemove: {
  imageName: string
  price: string
  imageId: string
  bucket: string
  bucketId: string
}) => {
  if (imageToRemove) {
    removedImages.value.push(imageToRemove)
    const index = imagesToEdit.value.findIndex(
      (image) => image.imageId === imageToRemove.imageId
    )
    imagesToEdit.value.splice(index, 1)
  }
}

const removeFile = (index: number) => {
  formData.value.images.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    if (editMode.value) {
      const { images, price, newFile, clientEvents, clientEvent } =
        formData.value
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
        // isLoading.value = false
        // return
      }

      const uniqueSelectedImages = [...new Set(selectedImages)]
      if (selectedImages.length !== uniqueSelectedImages.length) {
        toast.error('You have a non-unique image name as a selected image!')
        // isLoading.value = false
        // return
      }

      const combinedImageNames = [...existingImages, ...selectedImages]
      const uniqueCombinedImages = [...new Set(combinedImageNames)]
      if (combinedImageNames.length !== uniqueCombinedImages.length) {
        toast.error('You have a non-unique image name!')
        // isLoading.value = false
        // return
      }

      const payload = {
        id: editUuId.value,
        imagesToEdit: hasChanges.value ?? [],
        images: images,
        price: price,
        newFile: newFile,
        removedImages: removedImages.value,
        clientEvents: clientEvents.length > 0 ? clientEvents : [clientEvent],
      }
      await upload.patchImage(payload)
    }
    console.log('renderOverlayForm', renderOverlayForm.value)
    console.log('isLoading', isLoading.value)
    // else {
    //   await upload.image(formData.value)
    // }
    // formData.value = {
    //   name: '',
    //   description: '',
    //   images: [],
    //   clientDirectoryName: '',
    //   newFile: [],
    //   price: [],
    //   event: true,
    //   clientEvent: '',
    //   clientEvents: [],
    // }
    // removedImages.value = []
    // renderOverlayForm.value = false
    // hasChanges.value = []
    // isLoading.value = false
    // isLoading.value = true

    // await fetchGalleryData()
    if (editMode.value) {
      // toast.success('Successfully edited a Gallery!')
    } else {
      toast.success('Successfully created a Gallery!')
    }
  } catch (error) {
    /**
     *
     * @todo if it failes i need to renderOverlayForm false
     * @todo removedImages to []
     * @todo hasChanges to []
     * @todo some kind of thing that tells the admin something went wrong with
     * logs
     * */
    // console.error('Error submitting form:', error)
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

<style scoped>
/* Backdrop fade */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 200ms ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Modal materialize: fade + slight scale up */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
