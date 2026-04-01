import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function Preferences() {
  const [rooms, setRooms] = useState([])
  const [prefs, setPrefs] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await API.get('/student/rooms')

        // 🔥 SORT
        const sortedRooms = res.data.sort((a, b) => {
          if (a.block === b.block) {
            return a.room_number.localeCompare(b.room_number)
          }
          return a.block.localeCompare(b.block)
        })

        // 🔥 EXPAND ROOMS BASED ON AVAILABLE SLOTS
        const expandedRooms = []

        sortedRooms.forEach(room => {
          const availableSlots =
            (room.capacity || 1) - (room.current_occupancy || 0)

          for (let i = 0; i < availableSlots; i++) {
            expandedRooms.push({
              ...room,
              uniqueKey: `${room.id}-${i}` // important for React
            })
          }
        })

        setRooms(expandedRooms)

      } catch (err) {
        console.error("FETCH ERROR:", err.response?.data || err.message)
      }
    }

    fetchRooms()
  }, [])

  // ✅ Add room
  const handleSelect = (roomId) => {
    if (prefs.includes(roomId)) return

    if (prefs.length >= 10) {
      setMessage('Maximum 10 preferences allowed')
      return
    }

    setPrefs([...prefs, roomId])
    setMessage('')
  }

  // ✅ Remove
  const handleRemove = (roomId) => {
    setPrefs(prefs.filter(id => id !== roomId))
  }

  // ✅ Move Up
  const moveUp = (index) => {
    if (index === 0) return
    const newPrefs = [...prefs]
    ;[newPrefs[index - 1], newPrefs[index]] =
      [newPrefs[index], newPrefs[index - 1]]
    setPrefs(newPrefs)
  }

  // ✅ Move Down
  const moveDown = (index) => {
    if (index === prefs.length - 1) return
    const newPrefs = [...prefs]
    ;[newPrefs[index + 1], newPrefs[index]] =
      [newPrefs[index], newPrefs[index + 1]]
    setPrefs(newPrefs)
  }

  // ✅ Submit
  const handleSubmit = async () => {
    if (prefs.length === 0) {
      setMessage('Please select at least 1 room')
      return
    }

    try {
      await API.post('/student/preferences', {
        preferences: prefs.map((roomId, index) => ({
          room_id: roomId,
          priority: index + 1
        }))
      })

      setMessage('Preferences saved successfully')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error saving preferences')
    }
  }

  return (
    <>
      <Navbar />

      <div className="p-6 grid grid-cols-2 gap-6">

        {/* AVAILABLE ROOMS */}
        <div>
          <h2 className="text-xl font-bold mb-4">Available Rooms</h2>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {rooms.map(room => (
              <div
                key={room.uniqueKey}
                className="p-3 bg-white shadow rounded flex justify-between items-center"
              >
                <span>
                  {room.block}-{room.room_number} ({room.type})
                </span>

                <button
                  onClick={() => handleSelect(room.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PREFERENCES */}
        <div>
          <h2 className="text-xl font-bold mb-4">Your Preferences (Max 10)</h2>

          <div className="space-y-2">

            {prefs.length === 0 && (
              <p className="text-gray-500 text-sm">
                No preferences selected yet
              </p>
            )}

            {prefs.map((id, index) => {
              const room = rooms.find(r => r.id === id)

              return (
                <div
                  key={id}
                  className="p-3 bg-green-100 rounded flex justify-between items-center"
                >
                  <span>
                    {index + 1}. {room?.block}-{room?.room_number}
                  </span>

                  <div className="flex gap-2">

                    <button
                      onClick={() => moveUp(index)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      ↑
                    </button>

                    <button
                      onClick={() => moveDown(index)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      ↓
                    </button>

                    <button
                      onClick={() => handleRemove(id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>

                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded"
          >
            Submit Preferences
          </button>

          {message && (
            <p className="mt-3 text-sm text-blue-600">{message}</p>
          )}
        </div>

      </div>
    </>
  )
}