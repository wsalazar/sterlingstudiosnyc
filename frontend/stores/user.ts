import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
  }),
  actions: {
    setUserName(name: string) {
      this.name = name
    },

    clearUserName() {
      this.name = ''
    },
  },
  getters: {
    getUserName: (state) => state.name,
  },
})
