import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store'

// Components
import BrowseGigs from './components/BrowseGigs'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Register from './components/Register'
import GigDetail from './components/GigDetail'
import FreelancerDashboard from './components/FreelancerDashboard'
import ClientDashboard from './components/ClientDashboard'
import OrderDetail from './components/OrderDetail'
import Chat from './components/Chat'
import EditGig from './components/EditGig'
import FreelancerProfile from './components/FreelancerProfile'
import PaymentSuccess from './components/PaymentSuccess'

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated, isInitialized } = useAuthStore()

  // While initializing, show loading or allow the component to load
  // Don't redirect yet - wait for localStorage check
  if (!isInitialized) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin mb-4">
          <div className="text-4xl">✨</div>
        </div>
        <p className="text-gray-600">Loading your session...</p>
      </div>
    </div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />
  }

  return children
}

function AppContent() {
  const { initializeAuth } = useAuthStore()

  // Restore auth from localStorage on app start
  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/browse-gigs" element={<BrowseGigs />} />
      <Route path="/freelancer/:id" element={<FreelancerProfile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />

      {/* Protected Routes - All Users */}
      <Route
        path="/gig/:id"
        element={
          <ProtectedRoute>
            <GigDetail />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Freelancer */}
      <Route
        path="/freelancer-dashboard"
        element={
          <ProtectedRoute requiredRole="freelancer">
            <FreelancerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-gig/:id"
        element={
          <ProtectedRoute requiredRole="freelancer">
            <EditGig />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Client */}
      <Route
        path="/client-dashboard"
        element={
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Both */}
      <Route
        path="/order/:id"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:userId"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <AppContent />
    </Router>
  )
}
