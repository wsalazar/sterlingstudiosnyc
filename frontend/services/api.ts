import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // Use proxy
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: {
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}[] = []
const processQueue = (error: any, token = null) => {
  console.log('error:::token', error, token)
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
}

api.interceptors.response.use(
  (response) => {
    console.log('=== API Response Success ===')
    console.log('URL:', response.config.url)
    console.log('Status:', response.status)
    return response
  },
  async (error) => {
    console.log('=== API Response Error ===')
    console.log('URL:', error.config?.url)
    console.log('Status:', error.response?.status)
    console.log('Error:', error.message)

    const originalRequest = error.config
    if (!originalRequest._retry) {
      originalRequest._retry = false
    }
    console.log('Retry count:', originalRequest._retry)

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/v1/auth/refresh') // Don't retry refresh requests
    ) {
      console.log('=== 401 Error - Attempting Refresh ===')
      console.log('Original request URL:', originalRequest.url)

      if (isRefreshing) {
        console.log('Already refreshing, adding to queue')
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            console.log('Queue resolved, retrying original request')
            return api(originalRequest)
          })
          .catch((err) => {
            console.log('Queue rejected:', err)
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true
      console.log('Starting refresh process')

      try {
        console.log('Calling refresh endpoint...')
        await api.post('/v1/auth/refresh')
        console.log('Refresh successful, processing queue')
        processQueue(null)
        console.log('Retrying original request')
        return api(originalRequest)
      } catch (refreshError) {
        console.log('Refresh failed:', refreshError)
        processQueue(refreshError, null)

        // If refresh fails with 401, it means no valid refresh token
        // This is expected when user is not logged in
        if (
          axios.isAxiosError(refreshError) &&
          refreshError.response?.status === 401
        ) {
          console.log('No valid refresh token - user not logged in')
          if (process.client) {
            console.log('Resetting auth state')
            // const { useAuth } = await import('~/composables/useAuth')
            // const { resetAuth } = useAuth()
            // resetAuth()
          }
          // Don't reject the error, just let it pass through
          // This allows the original 401 to be handled normally
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
        console.log('Refresh process complete')
      }
    }
    return Promise.reject(error)
  }
)

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
    console.log('=== auth.validate() called ===')
    try {
      console.log('Making request to /v1/auth/me')
      const response = await api.get('/v1/auth/me')
      console.log('auth.validate() success:', response.data)
      return response.data
    } catch (error) {
      console.log('auth.validate() error:', error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log(
          '401 error in auth.validate(), throwing to let interceptor handle'
        )
        // Let the interceptor handle 401 errors for refresh
        throw error
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
