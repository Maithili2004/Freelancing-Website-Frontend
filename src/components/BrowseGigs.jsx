import React, { useState, useMemo } from 'react'
import { useApi } from '../hooks/useApi'
import GigCard from './GigCard'
import { useAuthStore } from '../store'
import { useNavigate } from 'react-router-dom'

export default function BrowseGigs() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { data: response, loading } = useApi('/gigs')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  
  // Handle response format: backend returns { gigs, total, page, pages }
  const gigs = response?.gigs || []

  const categories = useMemo(() => {
    if (!gigs || gigs.length === 0) return []
    return [...new Set(gigs.map((g) => g.category))].sort()
  }, [gigs])

  const filteredAndSortedGigs = useMemo(() => {
    let filtered = gigs || []

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (g) =>
          g.title.toLowerCase().includes(term) ||
          g.description.toLowerCase().includes(term) ||
          g.seller?.full_name.toLowerCase().includes(term)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((g) => g.category === selectedCategory)
    }

    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price)
    } else if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return filtered
  }, [gigs, searchTerm, selectedCategory, sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/client-dashboard')}
                className="bg-pink-900 text-white px-6 py-2 rounded-lg hover:bg-pink-800 transition"
              >
                My Dashboard
              </button>
            )}
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search gigs, freelancers, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-300">
                  <p className="text-gray-700 font-semibold">{filteredAndSortedGigs.length} services</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600 text-lg">Loading services...</p>
          </div>
        ) : filteredAndSortedGigs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedGigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-xl mb-6">No services found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="bg-pink-900 text-white px-6 py-3 rounded-lg hover:bg-pink-800 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
