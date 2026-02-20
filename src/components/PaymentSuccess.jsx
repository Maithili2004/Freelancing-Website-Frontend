import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { orderApi } from '../utils/apiClient'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const processPayment = async () => {
      try {
        const pendingOrderId = localStorage.getItem('pendingPaymentOrderId')
        const queryOrderId = searchParams.get('order')
        
        const orderId = pendingOrderId || queryOrderId

        if (!orderId) {
          toast.error('Payment verification failed: No order ID found')
          setTimeout(() => navigate('/client-dashboard'), 2000)
          return
        }

        localStorage.removeItem('pendingPaymentOrderId')

        const response = await orderApi.confirmPayment(orderId)
        
        if (response.data?.data?.paid_at) {
          toast.success('✅ Payment confirmed! Freelancer will start work now.')
        }
        
        // Redirect to refreshed dashboard
        setTimeout(() => {
          window.location.href = '/client-dashboard'
        }, 2000)

      } catch (error) {
        toast.error('Failed to process payment confirmation. Redirecting...')
        
        // Redirect anyway to dashboard so user can verify
        setTimeout(() => {
          window.location.href = '/client-dashboard'
        }, 3000)
      } finally {
        setProcessing(false)
      }
    }

    processPayment()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
        {processing ? (
          <>
            <div className="inline-block animate-spin mb-6">
              <div className="text-5xl">✨</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Processing Payment</h2>
            <p className="text-gray-600 mb-4">
              Verifying your payment with our server...
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-pink-900 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="w-3 h-3 bg-pink-900 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-pink-900 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              ⏱️ Redirecting to dashboard in a moment...
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-3">Payment Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. The freelancer will start working on your order.
            </p>
            <button
              onClick={() => navigate('/client-dashboard')}
              className="bg-pink-900 text-white px-6 py-3 rounded-lg hover:bg-pink-800 transition font-medium"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
