import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

export const userApi = {
  createUser: async (userData: {
    email: string
    password: string
    name: string
  }) => {
    try {
      const response = await api.post('/v1/auth/user', userData)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to create user'
        )
      }
      throw error
    }
  },
}

export const upload = {
  image: async (imageData: {
    name: string
    description: string
    images: File[]
    subdirectory: string
    price: string[]
    newFile: string[]
  }) => {
    try {
      const formData = new FormData()
      Object.entries(imageData).forEach(([index, value]) => {
        if (index !== 'images' && typeof value === 'string') {
          formData.append(index, value)
        } else if (index !== 'images' && typeof value === 'object') {
          const valueArray = Object.values(value)
          let count: number = 0

          valueArray.forEach((item) => {
            formData.append(`${index}[${count}]`, item)
            count += 1
          })
        }
      })
      imageData.images.forEach((file) => {
        formData.append('file', file)
      })

      const response = await api.post('v1/gallery', formData)
      return response.data
    } catch (error) {
      console.log(error)
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to upload images'
        )
      }
      throw error
    }
  },
  patchImage: async (patchData: {
    id: string
    imagesToEdit?: { imageName?: string; price?: string; id: string }[]
    removedImages: { imageName: string; price: string; id: string }[]
    images: File[]
    price: string[]
    newFile: string[]
  }) => {
    const { id, images, price, newFile, imagesToEdit, removedImages } =
      patchData
    const formData = new FormData()

    for (let index = 0; index < images.length; index++) {
      /**
       * For new images
       */
      formData.append(`image`, images[index])
      formData.append(`newPrice[]`, price[index])
      formData.append(`newFile[]`, newFile[index])
    }

    if (imagesToEdit) {
      for (let index = 0; index < imagesToEdit.length; index++) {
        formData.append('existingImages[]', JSON.stringify(imagesToEdit[index]))
      }
    }
    if (removedImages) {
      for (let index = 0; index < removedImages.length; index++) {
        formData.append('removedImages[]', removedImages[index].id)
      }
    }
    await api.patch(`v1/gallery/${id}`, formData)
  },
}
export const gallery = {
  get: async () => {
    try {
      return (await api.get('v1/gallery')).data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error)
      }
      throw error
    }
  },
  delete: async (id: string) => {
    try {
      return await api.delete(`v1/gallery/${id}`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error)
      }
      throw error
    }
  },
  patch: async (id: string, data: { newValue: string; fieldName: string }) => {
    await api.patch(`v1/gallery/update-fields/${id}`, data)
  },
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/v1/auth/login', credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed')
      }
      throw error
    }
  },
}

export const auth = {
  validate: async () => {
    try {
      const response = await api.get('/v1/auth/me')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // User is not authenticated
        return null
      }
      throw error
    }
  },
  logout: async () => {
    try {
      const response = await api.post('/v1/auth/logout')
      return response.data
    } catch (error) {
      throw error
    }
  },
}
