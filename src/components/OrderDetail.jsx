import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuthStore } from '../store'
import { orderApi, reviewApi } from '../utils/apiClient'
import toast from 'react-hot-toast'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const { data: order, loading, refetch } = useApi(`/orders/${id}`)
  const [approving, setApproving] = useState(false)
  const [paying, setPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Check if coming back from successful Stripe payment
  useEffect(() => {
    // Payment success is now handled in ClientDashboard
    // This component no longer handles payment redirect
  }, [])



  const handlePaymentNow = async () => {
    if (paying) return
    
    try {
      setPaying(true)
      
      const response = await orderApi.createPaymentIntent(id)
      const checkoutUrl = response.data?.checkout_url
      
      if (checkoutUrl) {
        localStorage.setItem('pendingPaymentOrderId', id)
        setTimeout(() => {
          // This will redirect to Stripe, which then redirects back to client-dashboard
          window.location.href = checkoutUrl
        }, 6000)
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process payment')
      setPaying(false)
    }
  }

  const handleApprovePayment = async () => {
    if (approving) return
    try {
      setApproving(true)
      await orderApi.approveOrder(id)
      toast.success('Order approved! Ready for payment.')
      refetch().catch(() => {})
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve order')
    } finally {
      setApproving(false)
    }
  }

  const handleApproveDelivery = async () => {
    if (approving) return
    try {
      setApproving(true)
      await orderApi.approveDelivery(id)
      toast.success('✅ Delivery approved! Order marked as completed.')
      await refetch()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve delivery')
    } finally {
      setApproving(false)
    }
  }

  const handleMarkWorkComplete = async () => {
    if (approving) return
    try {
      setApproving(true)
      // Mark order delivery as pending approval from client
      await orderApi.markWorkDone(id)
      toast.success('✅ Work completed! Waiting for client to approve.')
      await refetch()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark work complete')
    } finally {
      setApproving(false)
    }
  }

  const handleSubmitReview = async () => {
    if (submittingReview || !reviewComment) return
    try {
      setSubmittingReview(true)
      
      // Submit review
      await reviewApi.create({
        gig_id: order.gig_id,
        order_id: order.id,
        reviewed_user_id: order.seller_id,
        rating,
        comment: reviewComment,
        professionalism_rating: rating,
        communication_rating: rating,
        value_for_money_rating: rating,
      })
      
      // Also approve delivery to mark order as completed
      await orderApi.approveDelivery(id)
      
      toast.success('✅ Review submitted and delivery approved! Order completed.')
      setReviewComment('')
      setRating(5)
      setShowReviewForm(false)
      await refetch()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <button onClick={() => navigate(-1)} className="text-pink-900 hover:underline font-medium">
          ← Back
        </button>
      </div>
    )
  }

  const isClient = user?.id === order.buyer_id
  const isFreelancer = user?.id === order.seller_id

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-pink-900 hover:underline font-medium">
            ← Back
          </button>
        </div>
      </header>

      {paymentSuccess && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✅</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h2>
                <p className="text-green-700 mb-4">
                  Your payment has been processed. The freelancer will now start working on your order.
                </p>
                <button
                  onClick={() => navigate('/client-dashboard')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">{order.gig?.title}</h1>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Service Description</h2>
                  <p className="text-gray-600 leading-relaxed">{order.gig?.description}</p>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Order Timeline</h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="text-2xl">📋</div>
                      <div>
                        <p className="font-semibold text-gray-800">Requested</p>
                        <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {order.accepted_at && (
                      <div className="flex gap-4">
                        <div className="text-2xl">✅</div>
                        <div>
                          <p className="font-semibold text-gray-800">Accepted by Freelancer</p>
                          <p className="text-sm text-gray-600">{new Date(order.accepted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}

                    {order.status === 'in_progress' && (
                      <div className="flex gap-4">
                        <div className="text-2xl">⏳</div>
                        <div>
                          <p className="font-semibold text-gray-800">In Progress</p>
                          <p className="text-sm text-gray-600">Expected delivery: {order.gig?.delivery_time_days} days</p>
                        </div>
                      </div>
                    )}

                    {order.status === 'completed' && (
                      <div className="flex gap-4">
                        <div className="text-2xl">🎉</div>
                        <div>
                          <p className="font-semibold text-gray-800">Completed</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isClient && order.status === 'completed' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Leave a Review</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button
                          key={i}
                          onClick={() => setRating(i)}
                          className={`text-3xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this freelancer..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
                      rows="4"
                    />
                  </div>

                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewComment}
                    className="w-full bg-pink-900 text-white font-bold py-3 rounded-lg hover:bg-pink-800 transition disabled:bg-gray-400"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}

            {isClient && order.status === 'pending' && order.paid_at && !showReviewForm && (
              <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Approve Delivery</h2>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-purple-800">
                    The freelancer has submitted their work. Review it and approve when satisfied.
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
                >
                   Approve Delivery & Leave Review
                </button>
              </div>
            )}

            {isClient && order.status === 'pending' && order.paid_at && showReviewForm && (
              <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Approve Delivery & Leave Review</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button
                          key={i}
                          onClick={() => setRating(i)}
                          className={`text-3xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this freelancer..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
                      rows="4"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewComment}
                      className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                      {submittingReview ? 'Processing...' : '✅ Approve & Submit Review'}
                    </button>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-20">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold text-gray-800">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-gray-800">₹{order.price?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Participants</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Freelancer</p>
                    <p className="font-semibold text-gray-800">{order.seller?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Client</p>
                    <p className="font-semibold text-gray-800">{order.buyer?.full_name}</p>
                  </div>
                </div>
              </div>

              {isClient && order.status === 'pending' && !order.paid_at && (
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <span className="font-bold">✓ Freelancer Approved!</span><br/>
                      Ready for payment. Complete the payment to start the work.
                    </p>
                  </div>
                  <button
                    onClick={handlePaymentNow}
                    disabled={paying}
                    className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    🔒 {paying ? 'Processing...' : 'Pay Now with Stripe'}
                  </button>
                </div>
              )}

              {isClient && order.status === 'pending' && order.paid_at && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-rose-800 font-semibold">
                    ✅ Payment Done! Freelancer is working on your order.
                  </p>
                </div>
              )}

              {!isClient && order.status === 'pending' && !order.paid_at && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-rose-800">
                     Waiting for client to make payment...
                  </p>
                </div>
              )}

              {!isClient && order.status === 'pending' && order.paid_at && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-rose-800">
                      ✅ Payment received! Start working on this order.
                    </p>
                  </div>
                  <button
                    onClick={handleMarkWorkComplete}
                    disabled={approving}
                    className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 transition disabled:bg-gray-400"
                  >
                    {approving ? ' Processing...' : ' Work Done'}
                  </button>
                  <p className="text-xs text-gray-600 text-center mt-2">
                    Click when you've finished the work and it's ready for client review
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
