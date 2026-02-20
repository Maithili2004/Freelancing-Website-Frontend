import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuthStore } from '../store'
import { chatApi } from '../utils/apiClient'
import toast from 'react-hot-toast'

export default function Chat() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: otherUser } = useApi(`/auth/profile/${userId}`)
  const { data: messages, refetch } = useApi(`/messages/${userId}`)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Poll for new messages every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch().catch(() => {})
    }, 2000)
    return () => clearInterval(interval)
  }, [refetch])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      await chatApi.sendMessage(userId, { text: newMessage })
      setNewMessage('')
      setTimeout(() => refetch(), 300)
    } catch (error) {
      console.error('Send error:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-600 text-2xl hover:text-gray-800">
              ←
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{otherUser?.full_name || 'Chat'}</h1>
              <p className="text-sm text-gray-600">Online</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 overflow-y-auto">
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.sender_id === user?.id
                      ? 'bg-pink-900 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-pink-100' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Start a conversation</p>
            </p>
          </div>
        )}
      </div>

      <footer className="bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-900"
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="bg-pink-900 text-white px-6 py-3 rounded-lg hover:bg-pink-800 transition disabled:bg-gray-400 font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
