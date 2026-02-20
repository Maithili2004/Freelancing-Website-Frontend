import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useApi } from '../hooks/useApi'
import { gigApi } from '../utils/apiClient'
import toast from 'react-hot-toast'

const gigSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(100, 'Price must be at least ₹100'),
  delivery_time_days: z.number().min(1, 'Delivery time must be at least 1 day'),
})

export default function EditGig() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: gig, loading } = useApi(`/gigs/${id}`)
  const [updating, setUpdating] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(gigSchema),
  })

  useEffect(() => {
    if (gig) {
      setValue('title', gig.title)
      setValue('description', gig.description)
      setValue('category', gig.category)
      setValue('price', gig.price)
      setValue('delivery_time_days', gig.delivery_time_days)
    }
  }, [gig, setValue])

  const onSubmit = async (data) => {
    try {
      setUpdating(true)
      await gigApi.update(id, data)
      toast.success('Service updated successfully!')
      navigate('/freelancer-dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update service')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading gig details...</p>
      </div>
    )
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <button onClick={() => navigate(-1)} className="text-pink-900 hover:underline font-medium">
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-pink-900 hover:underline font-medium">
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Service</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
              <input
                type="text"
                placeholder="e.g., Professional Logo Design"
                {...register('title')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Describe your service in detail..."
                {...register('description')}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
                >
                  <option value="">Select Category</option>
                  <option value="design">Design</option>
                  <option value="writing">Writing</option>
                  <option value="programming">Programming</option>
                  <option value="marketing">Marketing</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  placeholder="500"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (Days)</label>
              <input
                type="number"
                placeholder="5"
                {...register('delivery_time_days', { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
              />
              {errors.delivery_time_days && (
                <p className="text-red-500 text-sm mt-1">{errors.delivery_time_days.message}</p>
              )}
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 bg-pink-900 text-white font-bold py-3 rounded-lg hover:bg-pink-800 transition disabled:bg-gray-400"
              >
                {updating ? 'Updating...' : 'Update Service'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
