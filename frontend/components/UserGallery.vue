<template>
  <div class="flex flex-wrap gap-10">
    <div
      v-for="img in imagesData"
      :key="img.id"
      class="flex flex-col items-center group"
    >
      <img
        :key="img.id"
        :src="`/v1/gallery/user/image/${galleryUuid}/${img.id}`"
        class="object-cover rounded-lg shadow blur-sm transition duration-300 cursor-pointer w-[10rem] h-[10rem]"
        @click="openImage(img.id)"
        alt="Gallery Thumbnail"
      />
      <div class="flex items-center w-full transition-all duration-300">
        <span
          class="block px-2 py-1 w-full text-sm text-center text-white bg-black bg-opacity-60 rounded transition-all duration-300 group-hover:w-1/2"
        >
          ${{ img.price }}
        </span>
        <button
          class="hidden justify-center px-3 py-1 ml-2 w-1/2 text-sm font-semibold text-white bg-green-600 rounded transition group-hover:inline-flex hover:bg-green-700"
          @click="buyImage(img.id)"
        >
          Buy
        </button>
      </div>
    </div>
  </div>
  <div
    v-if="selectedImage"
    class="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-70"
    @click="closeImage"
  >
    <button
      class="flex absolute top-4 right-4 justify-center items-center w-10 h-10 text-3xl font-bold text-white bg-black bg-opacity-40 rounded-full transition hover:bg-opacity-70"
      @click.stop="closeImage"
      aria-label="Close"
    >
      &times;
    </button>
    <img
      :src="`/v1/gallery/user/image/${galleryUuid}/${selectedImage}`"
      class="max-w-[90vw] max-h-[90vh] filter-none rounded-xl shadow-2xl"
      alt="Full gallery image"
      @click.stop
    />
  </div>
</template>
<script setup lang="ts">
import { gallery } from '../services/api'

const props = defineProps<{
  galleryData: { galleryUuid: string; userUuid: string }
}>()
const { galleryUuid, userUuid } = props.galleryData
const imagesData = ref<{ id: string; price: string }[]>([])
const selectedImage = ref<string | null>(null)

const openImage = (img: string) => {
  selectedImage.value = img
}

const renderButton = (img: string) => {
  imagesData.value.find((image) => image.id === img)
}

const closeImage = () => {
  selectedImage.value = null
}

onMounted(async () => {
  const images = await gallery.fetchImages(userUuid)
  if (images.data.success) {
    imagesData.value = images.data.data.images.map(
      (image: { uuid: string; price: string }) => ({
        id: image.uuid,
        price: image.price,
      })
    )
    console.log(imagesData.value)
  }
})

// if
</script>
