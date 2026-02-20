import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import GigCard from './GigCard'

export default function FreelancerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: freelancer, loading: freelancerLoading } = useApi(`/auth/profile/${id}`)
  const { data: gigs, loading: gigsLoading } = useApi(`/gigs?seller_id=${id}`)
  const { data: reviews, loading: reviewsLoading } = useApi(`/reviews/user/${id}`)

  if (freelancerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading freelancer profile...</p>
      </div>
    )
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Freelancer not found</p>
          <button
            onClick={() => navigate('/browse-gigs')}
            className="bg-pink-900 text-white px-6 py-3 rounded-lg hover:bg-pink-800"
          >
            Back to Browse Gigs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="text-pink-900 hover:underline font-medium mb-4"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{freelancer?.full_name}</h1>
              <p className="text-gray-600 mb-4">Email: {freelancer?.email}</p>
              
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="font-semibold text-gray-800">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                  </span>
                  <span className="text-gray-600 text-sm">({reviews.length} reviews)</span>
                </div>
              )}

              {freelancer?.bio && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">About</h2>
                  <p className="text-gray-600 leading-relaxed">{freelancer.bio}</p>
                </div>
              )}

              {freelancer?.skills && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="bg-pink-100 text-pink-900 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-gray-600 text-sm">
                  Member since {new Date(freelancer?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Services</h2>
          {gigsLoading ? (
            <p className="text-gray-600">Loading services...</p>
          ) : gigs && gigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg">No services available</p>
            </div>
          )}
        </div>

        {reviews && reviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-pink-900">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{review.reviewer?.full_name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
