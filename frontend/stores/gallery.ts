import { defineStore } from 'pinia'

export const getGalleryStore = defineStore('gallery', {
  state: () => ({
    galleryUuid: '',
    userUuid: '',
  }),
  actions: {
    setGallery(galleryData: { galleryUuid: string; userUuid: string }) {
      this.galleryUuid = galleryData.galleryUuid
      this.userUuid = galleryData.userUuid
    },

    clearGallery() {
      this.galleryUuid = ''
      this.userUuid = ''
    },
  },
  getters: {
    getGallery: (state) => ({
      galleryUuid: state.galleryUuid,
      userUuid: state.userUuid,
    }),
    getGalleryId: (state) => state.galleryUuid,
    getUserId: (state) => state.userUuid,
  },
  persist: true,
})
