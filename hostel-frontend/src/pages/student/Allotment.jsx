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

  // 🔥 HOLD
  const handleHold = async () => {
    try {
      await API.post('/student/allotment/hold')
      setMessage('Room put on hold')
      fetchAllotment()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error')
    }
  }

  // 🔥 UPGRADE (FIXED)
  const handleUpgrade = async () => {
    try {
      setLoading(true)

      // 🔥 get available rooms first
      const res = await API.get('/student/rooms/available')

      if (!res.data.length) {
        setMessage('No better rooms available')
        return
      }

      // pick first available (best option)
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

  // 🔥 CONFIRM
  const handleConfirm = async () => {
    try {
      await API.post('/student/allotment/confirm')
      setMessage('Allotment confirmed')
      fetchAllotment()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error confirming')
    }
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

          <div className="space-y-1">
            <p><strong>Room:</strong> {data.block}-{data.room_number}</p>
            <p><strong>Type:</strong> {data.type}</p>
            <p><strong>Round:</strong> {data.round}</p>
            <p>
              <strong>Status:</strong>{' '}
              {data.is_on_hold ? 'On Hold' : 'Confirmed'}
            </p>
          </div>

          {/* 🔥 ACTIONS */}
          <div className="flex flex-col gap-3">

            {/* HOLD */}
            <button
              onClick={handleHold}
              disabled={!data.is_on_hold && data.round === 'round2'}
              className="bg-yellow-500 text-white py-2 rounded disabled:opacity-50"
            >
              Put on Hold
            </button>

            {/* UPGRADE */}
            <button
              onClick={handleUpgrade}
              disabled={!data.is_on_hold || loading}
              className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Upgrading...' : 'Upgrade'}
            </button>

            {/* CONFIRM */}
            <button
              onClick={handleConfirm}
              disabled={!data.is_on_hold}
              className="bg-green-600 text-white py-2 rounded disabled:opacity-50"
            >
              Confirm & Exit Round 2
            </button>

          </div>

          {/* MESSAGE */}
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