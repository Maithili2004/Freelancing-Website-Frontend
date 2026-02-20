import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authApi } from '../utils/apiClient'
import { useAuthStore } from '../store'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['client', 'freelancer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function Register() {
  const navigate = useNavigate()
  const { setUser, setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const role = watch('role')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const { confirmPassword, ...submitData } = data
      
      const response = await authApi.register(submitData)
      
      localStorage.setItem('auth_token', response.data.token)
      setUser(response.data.user)
      setAuth(true)
      
      toast.success('Account created successfully!')
      setTimeout(() => {
        navigate(data.role === 'freelancer' ? '/freelancer-dashboard' : '/client-dashboard')
      }, 500)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-900 to-rose-600 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">Create Account</h1>
        <p className="text-center text-gray-600 mb-8">Join our marketplace</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              {...register('full_name')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900 transition"
            />
            {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900 transition"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">I am a:</label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="client"
                  {...register('role')}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="ml-3 text-gray-700 font-medium">Client (Looking for services)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="freelancer"
                  {...register('role')}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="ml-3 text-gray-700 font-medium">Freelancer (Offering services)</span>
              </label>
            </div>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
          </div>

          {role && (
            <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 text-sm text-rose-900 font-medium">
              {role === 'client'
                ? '✓ As a client, you can browse gigs, request services, and pay securely.'
                : '✓ As a freelancer, you can create gigs, accept orders, and build your reputation.'}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-900 text-white font-bold py-3 rounded-lg hover:bg-pink-800 transition disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-pink-900 font-bold hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}
