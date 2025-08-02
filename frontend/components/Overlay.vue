<template>
  <div
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
        <div v-if="editMode" class="flex">
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

        <div v-if="editMode && formData.event">
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
                v-for="(imageObj, index) in props.imagesToEdit"
                :key="index"
                :data-image-id="imageObj.imageId"
                class="flex gap-2 text-sm text-gray-600"
              >
                <span class="w-[8rem] p-0 m-0 truncate">{{
                  `${imageObj.bucket}`
                }}</span>
                <span
                  v-if="
                    !(
                      props.isImageNameEditable &&
                      imageObj.imageId === props.imageId &&
                      !props.isPriceEditable
                    )
                  "
                  class="w-[15rem] p-0 m-0 truncate"
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
                  class="w-[6rem] p-0 m-0 truncate"
                  v-if="
                    !(
                      props.isPriceEditable &&
                      imageObj.imageId === props.imageId &&
                      !props.isImageNameEditable
                    )
                  "
                  @click="editPrice(imageObj)"
                  >{{ imageObj.price }}</span
                >
                <input
                  v-else
                  class="p-0 rounded-md border-none outline-none focus:ring-0 w-[6rem]"
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
                  <font-awesome-icon :icon="['fas', 'times']" class="w-4 h-4" />
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
                  <font-awesome-icon :icon="['fas', 'times']" class="w-4 h-4" />
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
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'

library.add(faPlus, faTimes)

const props = defineProps<{
  newImageName: string
  newPrice: number
  isImageNameEditable: boolean
  isPriceEditable: boolean
  galleryOverlayTitle: string
  editMode: boolean
  imageId: string
  imagesToEdit: {
    imageName: string
    price: string
    imageId: string
    bucket: string
  }[]
  formData: {
    name: string
    clientDirectoryName: string
    event: boolean
    clientEvent: string
    description: string
    images: {
      name: string
      price: number
    }[]
    newFile: string[]
    price: number[]
    clientEvents: string[]
  }
}>()
const newImageName = computed({
  get: () => props.newImageName,
  set: (value: string) => emit('update:newImageName', value),
})

const newPrice = computed({
  get: () => props.newPrice,
  set: (value: number) => emit('update:newPrice', value),
})

const emit = defineEmits<{
  (e: 'remove-file', index: number): void
  (e: 'close-modal'): void
  (
    e: 'remove-gallery-files',
    imageObj: { imageId: string; imageName: string; bucket: string }
  ): void
  (e: 'edit-price', imageObj: { imageId: string; price: string }): void
  (
    e: 'on-enter-price',
    newPrice: number,
    imageObj: { imageId: string; price: string }
  ): void
  (e: 'cancel-image'): void
  (e: 'on-enter-image-name', index: number): void
  (e: 'edit-image-name', imageObj: { imageId: string; imageName: string }): void
  (e: 'handle-image-upload', event: Event): void
  (e: 'handle-submit'): void
  (e: 'handle-cancel'): void
  (e: 'update:newImageName', value: string): void
  (e: 'update:newPrice', value: number): void
}>()

const removeFile = (index: number) => {
  emit('remove-file', index)
}

const closeModal = () => {
  emit('close-modal')
}

const removeGalleryFiles = (index: number) => {
  emit('remove-gallery-files', props.imagesToEdit[index])
}

const editPrice = (imageObj: { imageId: string; price: string }) => {
  emit('edit-price', imageObj)
}

const onEnterPrice = (index: number) => {
  emit('on-enter-price', props.newPrice, props.imagesToEdit[index])
}

const cancelImage = () => {
  emit('cancel-image')
}

const onEnterImageName = (index: number) => {
  emit('on-enter-image-name', index)
}
const editImageName = (imageObj: { imageId: string; imageName: string }) => {
  emit('edit-image-name', imageObj)
}

const handleImageUpload = (event: Event) => {
  emit('handle-image-upload', event)
}

const handleSubmit = async () => {
  emit('handle-submit')
}
</script>
