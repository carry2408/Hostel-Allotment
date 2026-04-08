import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function Allotment() {
  const [data, setData]         = useState(null)
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading]   = useState({})
  const [message, setMessage]   = useState({ text: '', type: '' })

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const formatFee = (fee) => {
  const n = parseFloat(fee)
  return isNaN(n) ? '—' : `₹${n.toLocaleString('en-IN')}`
}

  const fetchAllotment = async () => {
    try {
      const res = await API.get('/student/allotment')
      setData(res.data)
    } catch {
      setData(null)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => { fetchAllotment() }, [])

  const handle = (key, fn) => async () => {
    setLoading(l => ({ ...l, [key]: true }))
    try { await fn() } finally {
      setLoading(l => ({ ...l, [key]: false }))
    }
  }

  const handleHold = handle('hold', async () => {
    try {
      await API.post('/student/allotment/hold')
      showMessage('Room put on hold. You can now choose an upgrade.')
      fetchAllotment()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to hold room.', 'error')
    }
  })

  const handleUpgrade = handle('upgrade', async () => {
    try {
      const res = await API.get('/student/rooms/available')
      if (!res.data.length) {
        showMessage('No available rooms for upgrade right now.', 'error')
        return
      }
      const best = res.data[0]
      await API.post('/student/allotment/upgrade', { room_id: best.id })
      showMessage(`Upgraded to ${best.block}-${best.room_number} successfully.`)
      fetchAllotment()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Upgrade failed.', 'error')
    }
  })

  const handleConfirm = handle('confirm', async () => {
    try {
      await API.post('/student/allotment/confirm')
      showMessage('Allotment confirmed. You are all set!')
      fetchAllotment()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Confirmation failed.', 'error')
    }
  })

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  )

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-gray-400 text-sm">
          <Spinner />
          <span className="ml-2">Loading your allotment...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">No allotment yet</h2>
          <p className="text-sm text-gray-400 mt-2">
            Your room will appear here once the admin runs the allotment.
          </p>
        </div>
      </div>
    )
  }

  const blockColor = {
    R: 'bg-blue-100 text-blue-600',
    S: 'bg-purple-100 text-purple-600',
    N: 'bg-green-100 text-green-600',
    G: 'bg-amber-100 text-amber-600',
  }

  const canUseRound2 = data.round2_open || data.is_on_hold
  const isConfirmed = !data.is_on_hold && (!data.round2_open || data.round === 'round2')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Allotment</h1>
          <p className="text-sm text-gray-400 mt-1">Room assigned to you by the system</p>
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium mb-1">Allotted Room</p>
                <h2 className="text-3xl font-bold text-white">
                  {data.block}-{data.room_number}
                </h2>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold
                ${blockColor[data.block] || 'bg-white text-blue-600'}`}>
                {data.block}
              </div>
            </div>
          </div>

          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            {[
              { label: 'Room Type',   value: data.type.charAt(0).toUpperCase() + data.type.slice(1) },
              { label: 'Fee',         value: formatFee(data.fee) },
              { label: 'Round',       value: data.round === 'round1' ? 'Round 1' : 'Round 2' },
              { label: 'Allotted On', value: new Date(data.allotted_at).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })
              },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="px-6 pb-5 flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-medium border
              ${data.is_on_hold
                ? 'bg-amber-50 text-amber-600 border-amber-100'
                : 'bg-green-50 text-green-600 border-green-100'}`}>
              {data.is_on_hold ? 'On Hold' : 'Confirmed'}
            </span>
            {data.round === 'round2' && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-purple-50 text-purple-600 border-purple-100">
                Upgraded
              </span>
            )}
          </div>
        </div>

        {isConfirmed ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-700 text-sm">Allotment Confirmed</p>
              <p className="text-xs text-green-600 mt-0.5">Your room is locked in for the current state of the allotment.</p>
            </div>
          </div>
        ) : !canUseRound2 ? (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-blue-700 text-sm">Round 2 Not Open</p>
              <p className="text-xs text-blue-600 mt-0.5">Your current allotment is visible here. Upgrade options will appear only when the admin opens round 2.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm">Round 2 — Upgrade Options</h3>
            <p className="text-xs text-gray-400">
              Put your room on hold, choose a better room, then confirm to lock it in.
            </p>

            <button
              onClick={handleHold}
              disabled={loading.hold || data.is_on_hold}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading.hold
                ? <span className="flex items-center justify-center gap-2"><Spinner /> Holding...</span>
                : data.is_on_hold ? 'Room is on hold' : 'Put Room on Hold'}
            </button>

            <button
              onClick={handleUpgrade}
              disabled={loading.upgrade || !data.is_on_hold}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading.upgrade
                ? <span className="flex items-center justify-center gap-2"><Spinner /> Upgrading...</span>
                : 'Auto Upgrade to Best Room'}
            </button>

            <button
              onClick={handleConfirm}
              disabled={loading.confirm || !data.is_on_hold}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading.confirm
                ? <span className="flex items-center justify-center gap-2"><Spinner /> Confirming...</span>
                : 'Confirm & Exit Round 2'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
