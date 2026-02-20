import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authApi } from '../utils/apiClient'
import { useAuthStore } from '../store'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const response = await authApi.login(data)
      
      console.log('Login response:', response.data)
      console.log('User role:', response.data.user.role)
      
      // Save token and user to localStorage for session persistence
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      setUser(response.data.user)
      setAuth(true)
      
      const dashboardRoute = response.data.user.role === 'freelancer' ? '/freelancer-dashboard' : '/client-dashboard'
      console.log('Navigating to:', dashboardRoute)
      
      toast.success('Login successful!')
      setTimeout(() => {
        navigate(dashboardRoute)
      }, 500)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-900 to-rose-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-center text-gray-600 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              {...register('email')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900 transition"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900 transition"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-900 text-white font-bold py-3 rounded-lg hover:bg-pink-800 transition disabled:bg-gray-400"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="text-pink-900 font-bold hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}
