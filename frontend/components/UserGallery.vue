<template>
  <img
    v-for="img in imagesData"
    :key="img"
    :src="`/v1/gallery/user/image/${galleryUuid}/${img}`"
  />
</template>
<script setup lang="ts">
import { gallery } from '../services/api'

const props = defineProps<{
  galleryData: { galleryUuid: string; userUuid: string }
}>()
const { galleryUuid, userUuid } = props.galleryData
const imagePaths = ref<string[]>([])
const imagesData = ref<number[]>([])

onMounted(async () => {
  const images = await gallery.fetchImages(userUuid)
  if (images.data.success) {
    imagesData.value = images.data.data.imageIds
    console.log(images)
    // imagePaths.value = images.data.data.map((img: any) => img.path)
  }
})

// if
</script>
