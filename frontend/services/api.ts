import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
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

export const requestApi = {
  uploadImage: async (imageData: {
    name: string
    description: string
    images: File[]
  }) => {
    try {
      const formData = new FormData()
      formData.append('name', imageData.name)
      formData.append('description', imageData.description)
      imageData.images.forEach((file) => {
        formData.append('file', file)
      })
      console.log('Form Data contents:')
      console.log('name:', formData.get('name'))
      console.log('description:', formData.get('description'))
      console.log('files:', imageData.images)
      console.log('formData files', formData.getAll('file'))
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

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/v1/auth/login', credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('api', response)
      localStorage.setItem('name', response.data.user.name)
      localStorage.setItem('access_token', response.data.access_token)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed')
      }
      throw error
    }
  },
}
