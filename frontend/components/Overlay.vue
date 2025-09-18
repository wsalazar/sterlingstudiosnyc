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
        <div class="flex">
          <input
            type="checkbox"
            id="event"
            v-model="formData.event"
            @change="handleEventChange"
            class="block mt-1 mr-2 w-5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <label
            for="event"
            class="inline-block text-sm font-medium text-gray-700"
            >Same Event</label
          >
        </div>

        <div v-if="formData.event">
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
              Client - {{ props.imagesToEdit[0].client }}<br />
            </p>
            <div class="flex justify-center">
              <h1 class="text-sm font-bold text-gray-500">Gallery files</h1>
            </div>
            <table
              class="w-full border border-gray-300 border-collapse table-fixed"
            >
              <thead>
                <tr class="bg-gray-50">
                  <th
                    class="px-3 py-2 w-1/4 text-sm font-medium text-left text-gray-700 border border-gray-300"
                  >
                    Bucket
                  </th>
                  <th
                    class="px-3 py-2 w-1/3 text-sm font-medium text-left text-gray-700 border border-gray-300"
                  >
                    Image Name
                  </th>
                  <th
                    class="px-3 py-2 w-1/6 text-sm font-medium text-left text-gray-700 border border-gray-300"
                  >
                    Price
                  </th>
                  <th
                    class="px-3 py-2 w-16 text-sm font-medium text-center text-gray-700 border border-gray-300"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(imageObj, index) in props.imagesToEdit"
                  :key="index"
                  :data-image-id="imageObj.imageId"
                  class="hover:bg-gray-50"
                >
                  <td class="px-3 py-2 border border-gray-300">
                    <EditableField
                      :isEditable="shouldShowBucketDirectorySpan(imageObj)"
                      :imageObj="imageObj"
                      :imageId="props.imageId"
                      :index="index"
                      :spanClass="'w-full p-0 m-0 truncate'"
                      :inputClass="'min-w-fit max-w-full rounded-md border-blue-500 pl-2 py-1 focus:ring-0'"
                      :inputValue="newBucketDirectory"
                      :spanValue="imageObj.bucket"
                      :name="'bucket'"
                      :type="'text'"
                      :onEnter="(e: Event) => onEnterBucketDirectory(e, index)"
                      :cancel="cancelBucketDirectory"
                      @click-to-edit="editBucketDirectory"
                    />
                  </td>
                  <td class="px-3 py-2 border border-gray-300">
                    <EditableField
                      :isEditable="shouldShowImageNameSpan(imageObj)"
                      :imageObj="imageObj"
                      :imageId="props.imageId"
                      :index="index"
                      :spanClass="'w-full p-0 m-0 truncate'"
                      :inputClass="'min-w-fit max-w-full rounded-md border-blue-500 pl-2 py-1 focus:ring-0'"
                      :inputValue="newImageName"
                      :spanValue="imageObj.imageName"
                      :type="'text'"
                      :name="'imageName'"
                      :onEnter="(e: Event) => onEnterImageName(e,index)"
                      :cancel="cancelImage"
                      @click-to-edit="editImageName"
                    />
                  </td>
                  <td class="px-3 py-2 border border-gray-300">
                    <EditableField
                      :isEditable="shouldShowPriceSpan(imageObj)"
                      :imageObj="imageObj"
                      :imageId="props.imageId"
                      :index="index"
                      :spanClass="'w-full p-0 m-0 truncate'"
                      :inputClass="'w-20 rounded-md border-blue-500 pl-2 py-1 focus:ring-0'"
                      :inputValue="String(newPrice)"
                      :spanValue="imageObj.price"
                      :type="'number'"
                      :name="'price'"
                      :onEnter="(e: Event) => onEnterPrice(e, index)"
                      :cancel="cancelPrice"
                      @click-to-edit="editPrice"
                    />
                  </td>
                  <td class="px-3 py-2 text-center border border-gray-300">
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
                  </td>
                </tr>
              </tbody>
            </table>
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
import { computed } from 'vue'

library.add(faPlus, faTimes)

const props = defineProps<{
  newImageName: string
  newBucketDirectory: string
  newPrice: number
  isImageNameEditable: boolean
  isBucketDirectoryEditable: boolean
  isPriceEditable: boolean
  galleryOverlayTitle: string
  editMode: boolean
  imageId: string
  imagesToEdit: {
    imageName: string
    price: string
    imageId: string
    bucket: string
    client: string
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

// Computed properties to simplify template logic
const isEditingBucketDirectory = computed(
  () =>
    props.isBucketDirectoryEditable &&
    !props.isImageNameEditable &&
    !props.isPriceEditable
)

const isEditingImageName = computed(
  () => props.isImageNameEditable && !props.isPriceEditable
)

const isEditingPrice = computed(
  () => props.isPriceEditable && !props.isImageNameEditable
)

const shouldShowBucketDirectorySpan = computed(() => (imageObj: any) => {
  return !(isEditingBucketDirectory.value && imageObj.imageId === props.imageId)
})

const shouldShowImageNameSpan = computed(() => (imageObj: any) => {
  return !(isEditingImageName.value && imageObj.imageId === props.imageId)
})

const shouldShowPriceSpan = computed(() => (imageObj: any) => {
  return !(isEditingPrice.value && imageObj.imageId === props.imageId)
})

const newImageName = computed({
  get: () => props.newImageName,
  set: (value: string) => emit('update:newImageName', value),
})
const newBucketDirectory = computed({
  get: () => props.newBucketDirectory,
  set: (value: string) => emit('update:newBucketDirectory', value),
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
  (e: 'cancel-price'): void
  (e: 'cancel-bucket-directory'): void
  (e: 'on-enter-image-name', newValue: string, index: number): void
  (e: 'edit-image-name', imageObj: { imageId: string; imageName: string }): void
  (e: 'handle-image-upload', event: Event): void
  (e: 'handle-submit'): void
  (e: 'handle-cancel'): void
  (e: 'update:newImageName', value: string): void
  (e: 'update:newPrice', value: number): void
  (e: 'update:newBucketDirectory', value: string): void
  (e: 'on-enter-bucket-directory', value: string, index: number): void
  (
    e: 'edit-bucket-directory',
    imageObj: { imageId: string; bucket: string }
  ): void
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

const onEnterPrice = (e: Event, index: number) => {
  const input = e.target as HTMLInputElement | null
  const newValue = input ? Number(input.value) : props.newPrice
  /**
   * @todo investigate update:newPrice in more depth once I
   * finish the new component
   */
  // emit('update:newPrice', newValue)
  emit('on-enter-price', newValue, props.imagesToEdit[index])
}

const onEnterBucketDirectory = (e: Event, index: number) => {
  const input = e.target as HTMLInputElement | null
  const newValue = input ? input.value : props.newBucketDirectory
  emit('on-enter-bucket-directory', newValue, index)
}

const onEnterImageName = (e: Event, index: number) => {
  const input = e.target as HTMLInputElement | null
  const newValue = input ? input.value : props.newImageName
  emit('on-enter-image-name', newValue, index)
}

const cancelBucketDirectory = () => {
  emit('cancel-bucket-directory')
}

const cancelPrice = () => {
  emit('cancel-price')
}

const cancelImage = () => {
  emit('cancel-image')
}

const editBucketDirectory = (imageObj: { imageId: string; bucket: string }) => {
  emit('edit-bucket-directory', imageObj)
}

const editImageName = (imageObj: { imageId: string; imageName: string }) => {
  emit('edit-image-name', imageObj)
}

const handleImageUpload = (event: Event) => {
  emit('handle-image-upload', event)
}

const handleEventChange = () => {
  if (!props.formData.event) {
    props.formData.clientEvent = ''
    props.formData.clientEvents = []
  }
}

const handleSubmit = async () => {
  emit('handle-submit')
}
</script>
