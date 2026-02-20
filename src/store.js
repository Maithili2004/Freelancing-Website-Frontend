import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  },
  
  setAuth: (isAuthenticated) => set({ isAuthenticated }),
  
  // Initialize auth from localStorage
  initializeAuth: () => {
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        const user = JSON.parse(userStr)
        set({ 
          user, 
          isAuthenticated: true,
          isInitialized: true 
        })
        console.log(`[AUTH] Restored from localStorage: ${user.email}`)
      } else {
        set({ isInitialized: true })
        console.log(`[AUTH] No token in localStorage`)
      }
    } catch (error) {
      console.error(`[AUTH] Failed to restore:`, error)
      set({ isInitialized: true })
    }
  },
}))
