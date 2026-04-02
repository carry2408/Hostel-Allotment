import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function Preferences() {
  const [rooms, setRooms]     = useState([])
  const [prefs, setPrefs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [search, setSearch]   = useState('')
  const [filterBlock, setFilterBlock] = useState('all')

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await API.get('/student/rooms')
        const sorted = res.data.sort((a, b) =>
          a.block === b.block
            ? a.room_number.localeCompare(b.room_number)
            : a.block.localeCompare(b.block)
        )
        setRooms(sorted)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  const handleSelect = (roomId) => {
    if (prefs.includes(roomId)) {
      showMessage('Room already in your preferences.', 'error')
      return
    }
    if (prefs.length >= 10) {
      showMessage('Maximum 10 preferences allowed.', 'error')
      return
    }
    setPrefs([...prefs, roomId])
  }

  const handleRemove = (roomId) => {
    setPrefs(prefs.filter(id => id !== roomId))
  }

  const moveUp = (index) => {
    if (index === 0) return
    const n = [...prefs]
    ;[n[index - 1], n[index]] = [n[index], n[index - 1]]
    setPrefs(n)
  }

  const moveDown = (index) => {
    if (index === prefs.length - 1) return
    const n = [...prefs]
    ;[n[index + 1], n[index]] = [n[index], n[index + 1]]
    setPrefs(n)
  }

  const handleSubmit = async () => {
    if (prefs.length === 0) {
      showMessage('Please select at least 1 room.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await API.post('/student/preferences', {
        preferences: prefs.map((room_id, index) => ({
          room_id,
          priority: index + 1,
        }))
      })
      showMessage('Preferences saved successfully.')
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to save preferences.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = rooms.filter(r => {
    const matchSearch = `${r.block}-${r.room_number}`.toLowerCase().includes(search.toLowerCase())
    const matchBlock  = filterBlock === 'all' || r.block === filterBlock
    return matchSearch && matchBlock
  })

  const blockColor = {
    R: 'bg-blue-100 text-blue-600',
    S: 'bg-purple-100 text-purple-600',
    N: 'bg-green-100 text-green-600',
    G: 'bg-amber-100 text-amber-600',
  }

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Room Preferences</h1>
          <p className="text-sm text-gray-400 mt-1">Select up to 10 rooms in your preferred order</p>
        </div>

        {message.text && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border
            ${message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-green-50 border-green-200 text-green-700'}`}>
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'error'
                ? <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />}
            </svg>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT — available rooms */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Available Rooms</h2>
              <input
                type="text"
                placeholder="Search rooms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition mb-3"
              />
              <div className="flex gap-2 flex-wrap">
                {['all', 'R', 'S', 'N', 'G'].map(b => (
                  <button
                    key={b}
                    onClick={() => setFilterBlock(b)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition border
                      ${filterBlock === b
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300'}`}
                  >
                    {b === 'all' ? 'All' : `Block ${b}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-50 max-h-[460px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
                  <Spinner /> Loading rooms...
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No rooms found.</div>
              ) : filtered.map(room => {
                const alreadyAdded = prefs.includes(room.id)
                return (
                  <div key={room.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0
                        ${blockColor[room.block] || 'bg-gray-100 text-gray-500'}`}>
                        {room.block}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {room.block}-{room.room_number}
                        </p>
                        <p className="text-xs text-gray-400">
                          {room.type} · ₹{Number(room.fee).toLocaleString()} · {room.current_occupancy}/{room.capacity} occupied
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelect(room.id)}
                      disabled={alreadyAdded || !room.is_available}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                        ${alreadyAdded
                          ? 'bg-green-50 text-green-500 border border-green-100 cursor-default'
                          : !room.is_available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {alreadyAdded ? 'Added' : !room.is_available ? 'Full' : 'Add'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT — selected preferences */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-sm">Your Preferences</h2>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border
                ${prefs.length >= 10
                  ? 'bg-red-50 text-red-500 border-red-100'
                  : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {prefs.length} / 10
              </span>
            </div>

            <div className="flex-1 divide-y divide-gray-50 max-h-[380px] overflow-y-auto">
              {prefs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm">
                  <svg className="w-8 h-8 mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  No preferences added yet
                </div>
              ) : prefs.map((id, index) => {
                const room = rooms.find(r => r.id === id)
                return (
                  <div key={id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                        ${blockColor[room?.block] || 'bg-gray-100 text-gray-500'}`}>
                        {room?.block}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {room?.block}-{room?.room_number}
                        </p>
                        <p className="text-xs text-gray-400">{room?.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === prefs.length - 1}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemove(id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-5 py-4 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={submitting || prefs.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <span className="flex items-center justify-center gap-2"><Spinner /> Saving...</span>
                  : `Submit ${prefs.length} Preference${prefs.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}