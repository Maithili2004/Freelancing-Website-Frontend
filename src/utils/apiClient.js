import axios from 'axios'
import { useAuthStore } from './store'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    
    // Log for payment requests
    if (config.url?.includes('/payment') || config.url?.includes('/confirm-payment')) {
      console.log(`[API-Request] ${config.method.toUpperCase()} ${config.url}`)
      console.log(`[API-Auth] Token being sent: ${token.substring(0, 30)}...`)
    }
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userId, data) => api.put(`/auth/profile/${userId}`, data),
}

// Gig API
export const gigApi = {
  getAll: (params = {}) => api.get('/gigs', { params }),
  getMyGigs: () => api.get('/gigs/my-gigs'),
  getById: (id) => api.get(`/gigs/${id}`),
  create: (data) => api.post('/gigs', data),
  update: (id, data) => api.put(`/gigs/${id}`, data),
  delete: (id) => api.delete(`/gigs/${id}`),
}

// Order API
export const orderApi = {
  create: (data) => api.post('/orders', data),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (type = 'all') => api.get('/orders', { params: { type } }),
  acceptOrder: (orderId) => api.put(`/orders/${orderId}/accept`),
  rejectOrder: (orderId) => api.put(`/orders/${orderId}/reject`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  approveOrder: (orderId) => api.put(`/orders/${orderId}/approve`),
  cancelOrder: (orderId, reason) => api.put(`/orders/${orderId}/cancel`, { reason }),
  createPaymentIntent: (orderId) => api.post(`/orders/${orderId}/payment`),
  confirmPayment: (orderId) => api.post(`/orders/${orderId}/confirm-payment`),
  markWorkDone: (orderId) => api.put(`/orders/${orderId}/mark-work-done`),
  approveDelivery: (orderId) => api.put(`/orders/${orderId}/approve-delivery`),
}

// Review API
export const reviewApi = {
  create: (data) => api.post('/reviews', data),
  getByGig: (gigId) => api.get(`/reviews/gig/${gigId}`),
  getByUser: (userId) => api.get(`/reviews/user/${userId}`),
}

// Chat API
export const chatApi = {
  sendMessage: (userId, data) => api.post('/messages', { receiver_id: userId, content: data.text }),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  getConversations: () => api.get('/messages/conversations'),
}

export default api
