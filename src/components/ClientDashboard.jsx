import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuthStore } from '../store'
import { orderApi } from '../utils/apiClient'
import toast from 'react-hot-toast'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState('all')
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const { data: response, refetch } = useApi('/orders?type=bought')
  
  // Handle response format: backend returns { orders, total, page, pages } or just orders array
  const orders = response?.orders || response || []

  // Handle payment success redirect from Stripe
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    const orderId = searchParams.get('order')
    
    if (paymentStatus === 'success' && orderId) {
      setShowPaymentSuccess(true)
      
      const confirmPaymentCall = async () => {
        try {
          const response = await orderApi.confirmPayment(orderId)
          
          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = '/client-dashboard'
          }, 3000)
          
        } catch (error) {
          // Refresh anyway
          setTimeout(() => {
            window.location.href = '/client-dashboard'
          }, 3000)
        }
      }
      
      confirmPaymentCall()
    }
  }, [searchParams])

  // Check localStorage for pending payment
  useEffect(() => {
    const pendingOrderId = localStorage.getItem('pendingPaymentOrderId')
    
    if (pendingOrderId) {
      localStorage.removeItem('pendingPaymentOrderId')
      
      const confirmPayment = async () => {
        try {
          const response = await orderApi.confirmPayment(pendingOrderId)
          
          // Refresh orders
          await refetch()
          toast.success('✅ Payment confirmed!  freelancer will start work.')
          
          // Redirect after 2 seconds
          setTimeout(() => {
            window.location.href = '/client-dashboard'
          }, 2000)
        } catch (error) {
          toast.error('Payment confirmation failed. Please try again.')
          
          // Still refresh page to load fresh data
          setTimeout(() => {
            window.location.href = '/client-dashboard'
          }, 2000)
        }
      }
      
      confirmPayment()
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const activeOrdersCount = orders ? orders.filter((o) => o.status === 'pending' && o.paid_at).length : 0
  const pendingOrdersCount = orders ? orders.filter((o) => o.status === 'requested').length : 0
  const completedOrdersCount = orders ? orders.filter((o) => o.status === 'completed').length : 0
  const totalSpendings = orders
    ? orders.filter((o) => o.paid_at).reduce((sum, o) => sum + (o.price || 0), 0)
    : 0

  const filteredOrders = orders
    ? orders.filter((order) => {
        if (filter === 'pending') return order.status === 'requested'
        if (filter === 'active') return order.status === 'pending' && order.paid_at
        if (filter === 'completed') return order.status === 'completed'
        return true
      })
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.full_name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {showPaymentSuccess && (
        <div className="bg-green-50 border-b-4 border-green-400">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="text-3xl">💳✅</div>
            <div className="flex-1">
              <p className="text-green-900 font-bold">Payment Successful!</p>
              <p className="text-green-800 text-sm">Your payment has been processed. The freelancer will now start working on your order.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Waiting Approval</p>
            <p className="text-3xl font-bold text-pink-900">{pendingOrdersCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{activeOrdersCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedOrdersCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Total Spendings</p>
            <p className="text-3xl font-bold text-yellow-600">₹{totalSpendings.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
              <button
                onClick={() => navigate('/browse-gigs')}
                className="bg-pink-900 text-white px-6 py-2 rounded-lg hover:bg-pink-800 transition"
              >
                Browse Services
              </button>
            </div>

            <div className="flex gap-4 flex-wrap">
              {[
                { value: 'all', label: 'All Orders' },
                { value: 'pending', label: 'Waiting Approval' },
                { value: 'active', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === f.value
                      ? 'bg-pink-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredOrders.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Seller</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-800 font-medium">{order.gig?.title}</td>
                      <td className="px-6 py-4 text-gray-600">{order.seller?.full_name}</td>
                      <td className="px-6 py-4 text-gray-800 font-semibold">₹{order.price?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status === 'pending'
                            ? 'Pending'
                            : order.status === 'requested'
                            ? 'Waiting Approval'
                            : order.status === 'completed'
                            ? 'Completed'
                            : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4 items-center">
                          <button
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="text-pink-900 hover:text-pink-800 hover:underline font-medium text-sm transition"
                          >
                            View Order
                          </button>
                          <button
                            onClick={() => navigate(`/chat/${order.seller_id}`)}
                            className="text-rose-600 hover:text-pink-800 hover:underline font-medium text-sm transition"
                          >
                            💬 Chat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-6">No orders found</p>
                <button
                  onClick={() => {
                    setFilter('all')
                    navigate('/browse-gigs')
                  }}
                  className="bg-pink-900 text-white px-6 py-3 rounded-lg hover:bg-pink-800 transition font-medium shadow-md"
                >
                  Browse Services
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
