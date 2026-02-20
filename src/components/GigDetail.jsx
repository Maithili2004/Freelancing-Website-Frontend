import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuthStore } from '../store'
import { orderApi } from '../utils/apiClient'
import toast from 'react-hot-toast'

export default function GigDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { data: gig, loading } = useApi(`/gigs/${id}`)
  const { data: reviews } = useApi(`/reviews/gig/${id}`)
  const [requesting, setRequesting] = useState(false)

  const handleRequestService = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (user?.role === 'freelancer') {
      toast.error('Freelancers cannot request services')
      return
    }

    if (requesting) return

    try {
      setRequesting(true)
      await orderApi.create({ gig_id: id })
      toast.success('Service requested! Waiting for freelancer approval.')
      setTimeout(() => {
        navigate('/client-dashboard')
      }, 1500)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request service')
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading service details...</p>
      </div>
    )
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Service not found</p>
          <button
            onClick={() => navigate('/browse-gigs')}
            className="bg-pink-900 text-white px-6 py-3 rounded-lg hover:bg-pink-800"
          >
            Back to Browse
          </button>
        </div>
      </div>
    )
  }

  const avgRating =
    reviews && reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-pink-900 hover:underline font-medium">
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{gig.title}</h1>

              {gig.images && Array.isArray(gig.images) && gig.images.length > 0 && (
                <div className="mb-8 rounded-lg overflow-hidden bg-gray-200 h-96">
                  <img 
                    src={gig.images[0]} 
                    alt={gig.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <button
                  onClick={() => navigate(`/freelancer/${gig.seller_id}`)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <div className="w-12 h-12 bg-pink-900 rounded-full flex items-center justify-center text-white font-bold">
                    {gig.seller?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-800">{gig.seller?.full_name}</p>
                  </div>
                </button>

                {avgRating > 0 && (
                  <div className="ml-auto text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-xl">★</span>
                      <span className="font-bold text-gray-800">{avgRating}</span>
                      <span className="text-gray-600">({reviews.length})</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Service</h2>
                <p className="text-gray-600 leading-relaxed text-lg">{gig.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-600 text-sm">Category</p>
                  <p className="text-lg font-bold text-gray-800 capitalize">{gig.category}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Delivery Time</p>
                  <p className="text-lg font-bold text-gray-800">{gig.delivery_time_days} days</p>
                </div>
              </div>

              {reviews && reviews.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews</h2>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-l-4 border-pink-900 pl-4 py-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-gray-800">{review.reviewer?.full_name}</p>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{new Date(review.created_at).toLocaleDateString()}</p>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-20">
              <div className="mb-8">
                <p className="text-gray-600 text-sm mb-2">Price</p>
                <p className="text-5xl font-bold text-pink-900">₹{gig.price?.toLocaleString('en-IN')}</p>
              </div>

              <button
                onClick={handleRequestService}
                disabled={
                  requesting ||
                  !isAuthenticated ||
                  (user?.role === 'freelancer') ||
                  user?.id === gig.seller_id
                }
                className={`w-full py-4 rounded-lg font-bold text-lg mb-4 transition ${
                  !isAuthenticated || user?.role === 'freelancer' || user?.id === gig.seller_id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-pink-900 text-white hover:bg-pink-800'
                }`}
              >
                {requesting ? 'Requesting...' : 'Request Service'}
              </button>

              {!isAuthenticated && (
                <p className="text-sm text-gray-600 text-center mb-4">
                  <button onClick={() => navigate('/login')} className="text-pink-900 hover:underline font-medium">
                    Sign in to request
                  </button>
                </p>
              )}

              {user?.role === 'freelancer' && (
                <p className="text-sm text-gray-600 text-center bg-gray-50 p-3 rounded-lg">
                  Freelancers cannot request services
                </p>
              )}

              {user?.id === gig.seller_id && (
                <p className="text-sm text-gray-600 text-center bg-gray-50 p-3 rounded-lg">
                  This is your service
                </p>
              )}

              <div className="border-t pt-6 mt-6">
                <h3 className="font-bold text-gray-800 mb-4">Service Details</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-800">📋 Category:</span> {gig.category}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">📅 Delivery:</span> {gig.delivery_time_days} days
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">👤 Seller:</span> {gig.seller?.full_name}
                  </p>
                  {avgRating > 0 && (
                    <p>
                      <span className="font-medium text-gray-800">⭐ Rating:</span> {avgRating} ({reviews?.length})
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
