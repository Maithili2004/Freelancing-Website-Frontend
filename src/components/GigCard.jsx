import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function GigCard({ gig }) {
  const navigate = useNavigate()
  
  // Get first image from images array
  const firstImage = gig.images && Array.isArray(gig.images) && gig.images.length > 0 
    ? gig.images[0] 
    : null

  return (
    <div
      onClick={() => navigate(`/gig/${gig.id}`)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden border border-gray-100"
    >
      <div className="relative h-48 bg-gradient-to-r from-pink-900 to-rose-600 flex items-center justify-center overflow-hidden">
        {firstImage ? (
          <img 
            src={firstImage} 
            alt={gig.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-4xl">📋</span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">{gig.title}</h3>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{gig.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-pink-900 font-bold text-lg">
            ₹{gig.price?.toLocaleString('en-IN')}
          </span>
          <span className="text-xs bg-pink-100 text-pink-900 px-3 py-1 rounded-full capitalize">
            {gig.category}
          </span>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-1 mb-3">
          📅 {gig.delivery_time_days} days delivery
        </div>

        {gig.seller && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-600">
              By <span className="font-semibold text-gray-800">{gig.seller?.full_name}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
