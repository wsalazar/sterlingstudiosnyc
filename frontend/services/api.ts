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
  }) => {
    try {
      const formData = new FormData()
      Object.entries(imageData).forEach(([index, value]) => {
        if (index !== 'images' && typeof value === 'string') {
          formData.append(index, value)
        }
      })
      imageData.images.forEach((file) => {
        formData.append('file', file)
      })

      const response = await api.post('v1/gallery', formData)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to upload images'
        )
      }
      throw error
    }
  },
}
export const fetch = {
  gallery: async () => {
    try {
      return await api.get('v1/gallery')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error)
      }
      throw error
    }
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
      console.log('login', response.data)
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
