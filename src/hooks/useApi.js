import { useState, useEffect } from 'react'
import api from '../utils/apiClient'

export const useApi = (endpoint) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get(endpoint)
      // Handle both cases: response.data.data or response.data directly
      const result = response.data.data || response.data
      setData(result)
      setError(null)
      return result
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch data'
      setError(errorMsg)
      setData(null)
      // Don't throw - let the component handle missing data gracefully
      console.warn(`[useApi] Error fetching ${endpoint}:`, errorMsg)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [endpoint])

  const refetch = async () => {
    return fetchData()
  }

  return { data, loading, error, refetch }
}
