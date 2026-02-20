import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../utils/store'
import { gigApi, orderApi } from '../utils/apiClient'
import { useApi } from '../hooks/useApi'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const gigSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(5, 'Price must be at least $5'),
  delivery_time_days: z.number().min(1, 'Delivery time must be at least 1 day'),
})

export default function FreelancerDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { data: gigs, loading, refetch: refetchGigs } = useApi('/gigs/my-gigs')
  const { data: orders, loading: ordersLoading, refetch: refetchOrders } = useApi('/orders?type=sold')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [processingOrderId, setProcessingOrderId] = useState(null)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(gigSchema),
  })

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImages((prev) => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const onCreateGig = async (data) => {
    setIsSubmitting(true)
    try {
      await gigApi.create({
        ...data,
        images: uploadedImages,
        features: [],
      })
      toast.success('Gig created successfully!')
      setShowCreateForm(false)
      setUploadedImages([])
      reset()
      refetchGigs().catch(() => {})
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create gig')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptOrder = async (orderId) => {
    if (processingOrderId === orderId) return
    
    setProcessingOrderId(orderId)
    try {
      await orderApi.acceptOrder(orderId)
      toast.success('Order request accepted! Waiting for client payment.')
      refetchOrders().catch(() => {})
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to accept order')
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleRejectOrder = async (orderId) => {
    if (processingOrderId === orderId) return
    
    setProcessingOrderId(orderId)
    try {
      await orderApi.rejectOrder(orderId)
      toast.success('Order request rejected')
      refetchOrders().catch(() => {})
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject order')
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm('Are you sure you want to delete this gig? This action cannot be undone.')) {
      return
    }
    
    try {
      await gigApi.delete(gigId)
      toast.success('Gig deleted successfully!')
      refetchGigs().catch(() => {})
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete gig')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.full_name}</p>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Total Gigs</p>
            <p className="text-3xl font-bold text-pink-900">{gigs?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Active Orders</p>
            <p className="text-3xl font-bold text-blue-600">{orders?.filter(o => o.status === 'in_progress').length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Completed Orders</p>
            <p className="text-3xl font-bold text-green-600">{orders?.filter(o => o.status === 'completed').length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-yellow-600">
              ₹{
                orders
                  ?.filter(o => o.status === 'completed' || o.paid_at)
                  .reduce((sum, o) => sum + (o.price || 0), 0)
                  .toFixed(2) || 0
              }
            </p>
          </div>
        </div>

        <div className="mb-12">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-pink-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-800 mb-6"
          >
            {showCreateForm ? 'Cancel' : '+ Create New Gig'}
          </button>

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a New Gig</h2>
              <form onSubmit={handleSubmit(onCreateGig)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gig Title</label>
                  <input
                    {...register('title')}
                    type="text"
                    placeholder="What service will you offer?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-900 focus:outline-none"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    {...register('description')}
                    placeholder="Describe your service in detail..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-900 focus:outline-none"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      {...register('category')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-900 focus:outline-none"
                    >
                      <option value="">Select category</option>
                      <option value="writing">Writing</option>
                      <option value="design">Design</option>
                      <option value="programming">Programming</option>
                      <option value="marketing">Marketing</option>
                      <option value="video">Video</option>
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.)</label>
                    <input
                      {...register('price', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="5"
                      placeholder="50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-900 focus:outline-none"
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (days)</label>
                  <input
                    {...register('delivery_time_days', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    placeholder="7"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-900 focus:outline-none"
                  />
                  {errors.delivery_time_days && <p className="text-red-500 text-sm mt-1">{errors.delivery_time_days.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-900 focus:outline-none"
                  />
                  <p className="text-gray-500 text-sm mt-1">Upload multiple images to showcase your gig</p>
                </div>

                {uploadedImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview Images ({uploadedImages.length})</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img src={image} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-pink-900 text-white py-3 rounded-lg font-bold hover:bg-pink-800 transition disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Creating...' : 'Create Gig'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Gigs</h2>
          {loading ? (
            <p className="text-gray-600">Loading your gigs...</p>
          ) : gigs && gigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <div key={gig.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{gig.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{gig.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-pink-900 font-bold">₹{gig.price}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${gig.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {gig.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-gig/${gig.id}`)}
                      className="flex-1 bg-pink-900 text-white py-2 rounded-lg hover:bg-pink-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGig(gig.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg">No gigs yet. Create your first gig!</p>
            </div>
          )}
        </div>

        {/* Pending Requests Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Requests</h2>
          {ordersLoading ? (
            <p className="text-gray-600">Loading requests...</p>
          ) : orders && orders.filter(o => o.status === 'requested').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.filter(o => o.status === 'requested').map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{order.gig?.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{order.gig?.description}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600">Budget:</span>
                      <span className="text-2xl font-bold text-pink-900">₹{order.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Requested by:</span>
                      <span className="font-semibold text-gray-800">{order.buyer?.full_name}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4">
                    Requested {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={processingOrderId === order.id}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
                    >
                      {processingOrderId === order.id ? 'Processing...' : '✓ Accept'}
                    </button>
                    <button
                      onClick={() => handleRejectOrder(order.id)}
                      disabled={processingOrderId === order.id}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium disabled:bg-gray-400"
                    >
                      {processingOrderId === order.id ? 'Processing...' : '✕ Reject'}
                    </button>
                    <button
                      onClick={() => navigate(`/chat/${order.buyer_id}`)}
                      className="flex-1 bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 font-medium"
                    >
                      💬 Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg">No pending requests. You're all caught up!</p>
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Orders</h2>
          {ordersLoading ? (
            <p className="text-gray-600">Loading orders...</p>
          ) : orders && orders.filter(o => o.status !== 'requested').length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Gig</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Buyer</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => o.status !== 'requested').map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{order.gig?.title}</p>
                          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{order.buyer?.full_name}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-pink-900">₹{order.price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="text-pink-900 hover:underline text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/chat/${order.buyer_id}`)}
                            className="text-rose-600 hover:underline text-sm font-medium"
                          >
                            💬 Chat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg">No orders yet. Keep creating great gigs!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
