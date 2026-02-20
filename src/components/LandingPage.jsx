import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-pink-900">Online Market Place</h1>
          <div className="flex gap-4">
            {user ? (
              <button
                onClick={() => navigate(user.role === 'freelancer' ? '/freelancer-dashboard' : '/client-dashboard')}
                className="bg-pink-900 text-white px-6 py-2 rounded-lg hover:bg-pink-800"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-pink-900 px-6 py-2 rounded-lg hover:bg-gray-100"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-pink-900 text-white px-6 py-2 rounded-lg hover:bg-pink-800"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-900 to-rose-600 text-white py-20 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">About Our Platform</h1>
          <p className="text-xl font-light">
            Connect with skilled freelancers from around the world and get your projects completed by experts
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our Freelance Marketplace</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you need design, writing, programming, marketing, or any other service, we've got the right professional for you. 
              Our platform connects clients with talented freelancers in a secure and transparent environment.
            </p>
          </div>

          {/* Three Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* For Clients */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg shadow p-8">
              <div className="text-5xl mb-4">👤</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Clients</h3>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Browse thousands of gigs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>View freelancer profiles & reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Send service requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Secure payment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Direct messaging with freelancers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Quality guaranteed work</span>
                </li>
              </ul>
            </div>

            {/* For Freelancers */}
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg shadow p-8">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Freelancers</h3>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Create unlimited gigs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Set your own rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Build your professional profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Receive client reviews & ratings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Direct communication with clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Grow your freelance business</span>
                </li>
              </ul>
            </div>

            {/* Platform Features */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-8">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Platform Features</h3>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Two-sided marketplace</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Real-time messaging</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Secure payments with Stripe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Order management system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Review & rating system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>24/7 customer support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-pink-900 to-rose-600 rounded-lg p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8">Join thousands of clients and freelancers already using our platform</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-pink-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100"
              >
                Sign Up Now
              </button>
             
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">About Us</h3>
              <p className="text-sm">Leading freelance marketplace connecting talent with opportunity.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">For Clients</h3>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Browse Gigs</a></li>
                <li><a href="#" className="hover:text-white">Post a Project</a></li>
                <li><a href="#" className="hover:text-white">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">For Freelancers</h3>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Create Gigs</a></li>
                <li><a href="#" className="hover:text-white">Find Jobs</a></li>
                <li><a href="#" className="hover:text-white">Become a Seller</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2026 Online Market Place. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
