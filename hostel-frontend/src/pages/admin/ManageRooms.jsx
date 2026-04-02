import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function ManageRooms() {
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding]   = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [search, setSearch]   = useState('')
  const [filterBlock, setFilterBlock] = useState('all')

  const [form, setForm] = useState({
    block:       'R',
    room_number: '',
    type:        'single',
    fee:         '',
    capacity:    1,
  })

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const fetchRooms = async () => {
    try {
      const res = await API.get('/admin/rooms')
      setRooms(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRooms() }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'type' ? { capacity: value === 'single' ? 1 : 2 } : {}),
    }))
  }

  const handleAdd = async () => {
    if (!form.room_number || !form.fee)
      return showMessage('Room number and fee are required.', 'error')
    setAdding(true)
    try {
      await API.post('/admin/rooms', form)
      showMessage(`Room ${form.block}-${form.room_number} added successfully.`)
      setForm({ block: 'R', room_number: '', type: 'single', fee: '', capacity: 1 })
      fetchRooms()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to add room.', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id, label) => {
    if (!window.confirm(`Delete room ${label}?`)) return
    try {
      await API.delete(`/admin/rooms/${id}`)
      showMessage(`Room ${label} deleted.`)
      fetchRooms()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete room.', 'error')
    }
  }

  const filtered = rooms.filter(r => {
    const matchSearch = `${r.block}-${r.room_number}`.toLowerCase().includes(search.toLowerCase())
    const matchBlock  = filterBlock === 'all' || r.block === filterBlock
    return matchSearch && matchBlock
  })

  const stats = {
    total:     rooms.length,
    available: rooms.filter(r => r.is_available).length,
    occupied:  rooms.filter(r => !r.is_available).length,
    single:    rooms.filter(r => r.type === 'single').length,
    double:    rooms.filter(r => r.type === 'double').length,
  }

  const formatFee = (fee) => {
  const n = parseFloat(fee)
  return isNaN(n) ? '—' : `₹${n.toLocaleString('en-IN')}`
}

  const inputClass = "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Rooms</h1>
          <p className="text-sm text-gray-400 mt-1">Add or remove hostel rooms across all blocks</p>
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

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total',     value: stats.total,     color: 'bg-blue-50 text-blue-600 border-blue-100'     },
            { label: 'Available', value: stats.available, color: 'bg-green-50 text-green-600 border-green-100'  },
            { label: 'Occupied',  value: stats.occupied,  color: 'bg-red-50 text-red-500 border-red-100'        },
            { label: 'Single',    value: stats.single,    color: 'bg-purple-50 text-purple-600 border-purple-100'},
            { label: 'Double',    value: stats.double,    color: 'bg-amber-50 text-amber-600 border-amber-100'  },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-1 opacity-75">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Add New Room</h2>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Block</label>
              <select name="block" value={form.block} onChange={handleChange} className={inputClass}>
                {['R', 'S', 'N', 'G'].map(b => (
                  <option key={b} value={b}>Block {b} {b === 'R' ? '(Single)' : '(Double)'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Room Number</label>
              <input
                name="room_number"
                value={form.room_number}
                placeholder="e.g. R101"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                <option value="single">Single</option>
                <option value="double">Double</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Fee (₹)</label>
              <input
                name="fee"
                value={form.fee}
                placeholder="e.g. 50000"
                onChange={handleChange}
                type="number"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Capacity</label>
              <select name="capacity" value={form.capacity} onChange={handleChange} className={inputClass}>
                <option value={1}>1 Person</option>
                <option value={2}>2 Persons</option>
              </select>
            </div>

            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
            >
              {adding ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Adding...
                </span>
              ) : 'Add Room'}
            </button>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search rooms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-48 border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
              />
              <div className="flex gap-2">
                {['all', 'R', 'S', 'N', 'G'].map(b => (
                  <button
                    key={b}
                    onClick={() => setFilterBlock(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border
                      ${filterBlock === b
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300'}`}
                  >
                    {b === 'all' ? 'All' : `Block ${b}`}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Loading rooms...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No rooms found.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                {filtered.map(room => (
                  <div key={room.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0
                        ${room.is_available
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-500'}`}>
                        {room.block}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {room.block}-{room.room_number}
                        </p>
                        <p className="text-xs text-gray-400">
                          {room.type} · {formatFee(room.fee)} · {room.current_occupancy}/{room.capacity} occupied
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium
                        ${room.is_available
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-500'}`}>
                        {room.is_available ? 'Available' : 'Full'}
                      </span>
                      <button
                        onClick={() => handleDelete(room.id, `${room.block}-${room.room_number}`)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}