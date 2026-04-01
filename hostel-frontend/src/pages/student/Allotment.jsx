import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function Allotment() {
  const [data, setData] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchAllotment = async () => {
    try {
      const res = await API.get('/student/allotment')
      setData(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchAllotment()
  }, [])

  const handleHold = async () => {
    try {
      await API.post('/student/allotment/hold')
      setMessage('Room put on hold')
      fetchAllotment()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error')
    }
  }

  const handleUpgrade = async () => {
    try {
      setLoading(true)

      const res = await API.get('/student/rooms/available')

      if (!res.data.length) {
        setMessage('No better rooms available')
        return
      }

      const betterRoom = res.data[0]

      await API.post('/student/allotment/upgrade', {
        room_id: betterRoom.id
      })

      setMessage('Upgraded successfully')
      fetchAllotment()

    } catch (err) {
      setMessage(err.response?.data?.message || 'Upgrade failed')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    try {
      await API.post('/student/allotment/confirm')
      setMessage('Allotment confirmed')
      fetchAllotment()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error confirming')
    }
  }

  const getStatusStyle = (isOnHold) => {
    return isOnHold
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-green-100 text-green-700'
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <div className="p-6 text-center text-gray-500">
          No allotment yet
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-lg mx-auto">

        <div className="bg-white shadow rounded-xl p-6 space-y-4">

          <h2 className="text-xl font-bold text-blue-600">
            Your Allotment
          </h2>

          {/* 🔥 NAME */}
          <p className="text-lg font-medium text-gray-800">
            {data.name}
          </p>

          <div className="space-y-1">
            <p><strong>Room:</strong> {data.block}-{data.room_number}</p>
            <p><strong>Type:</strong> {data.type}</p>
            <p><strong>Round:</strong> {data.round}</p>

            <p>
              <strong>Status:</strong>{' '}
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(data.is_on_hold)}`}>
                {data.is_on_hold ? 'On Hold' : 'Confirmed'}
              </span>
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-3">

            <button
              onClick={handleHold}
              disabled={!data.is_on_hold && data.round === 'round2'}
              className="bg-yellow-500 text-white py-2 rounded disabled:opacity-50"
            >
              Put on Hold
            </button>

            <button
              onClick={handleUpgrade}
              disabled={!data.is_on_hold || loading}
              className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Upgrading...' : 'Upgrade'}
            </button>

            <button
              onClick={handleConfirm}
              disabled={!data.is_on_hold}
              className="bg-green-600 text-white py-2 rounded disabled:opacity-50"
            >
              Confirm & Exit Round 2
            </button>

          </div>

          {message && (
            <p className="text-sm text-blue-600 text-center">
              {message}
            </p>
          )}

        </div>
      </div>
    </>
  )
}