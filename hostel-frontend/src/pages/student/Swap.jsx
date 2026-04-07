import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function Swap() {
  const [usn, setUsn]           = useState('')
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] })
  const [loading, setLoading]   = useState(false)
  const [responding, setResponding] = useState({})
  const [message, setMessage]   = useState({ text: '', type: '' })

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const fetchRequests = async () => {
    try {
      const res = await API.get('/student/swap/requests')
      setRequests(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const requestSwap = async () => {
    if (!usn.trim()) {
      showMessage('Please enter the target student USN.', 'error')
      return
    }
    setLoading(true)
    try {
      await API.post('/student/swap/request', { target_usn: usn })
      showMessage('Swap request sent successfully.')
      setUsn('')
      fetchRequests()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to send request.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const respond = async (id, action) => {
    setResponding(r => ({ ...r, [id]: action }))
    try {
      await API.put(`/student/swap/${id}/respond`, { action })
      showMessage(`Request ${action === 'accepted' ? 'accepted successfully' : 'rejected'}.`,
        action === 'accepted' ? 'success' : 'error')
      fetchRequests()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to respond.', 'error')
    } finally {
      setResponding(r => ({ ...r, [id]: null }))
    }
  }

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  )

  const statusStyle = {
    pending:  'bg-yellow-50 text-yellow-600 border-yellow-100',
    accepted: 'bg-green-50 text-green-600 border-green-100',
    rejected: 'bg-red-50 text-red-500 border-red-100',
    cancelled:'bg-gray-100 text-gray-500 border-gray-200',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Room Swap</h1>
          <p className="text-sm text-gray-400 mt-1">Request a mutual room swap with another student</p>
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 text-sm mb-1">Send Swap Request</h2>
          <p className="text-xs text-gray-400 mb-4">
            Enter the USN of the student you want to swap rooms with. Both students must have an allotment.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. 1MS24CS002"
              value={usn}
              onChange={e => setUsn(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && requestSwap()}
              className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            />
            <button
              onClick={requestSwap}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="flex items-center gap-2"><Spinner /> Sending...</span>
                : 'Send Request'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">Incoming Requests</h2>
            {requests.incoming?.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                {requests.incoming.length} pending
              </span>
            )}
          </div>

          {!requests.incoming?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm">
              <svg className="w-8 h-8 mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              No incoming swap requests
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.incoming.map(req => (
                <div key={req.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800 text-sm">
                        {req.requester_name || req.requester_usn}
                        <span className="text-gray-400 font-normal ml-1.5 text-xs">
                          {req.requester_usn}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                          Their room: <strong>{req.their_block}-{req.their_room}</strong>
                        </span>
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                          Your room: <strong>{req.your_block}-{req.your_room}</strong>
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(req.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => respond(req.id, 'accepted')}
                        disabled={!!responding[req.id]}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                      >
                        {responding[req.id] === 'accepted'
                          ? <span className="flex items-center gap-1"><Spinner /> Accepting...</span>
                          : 'Accept'}
                      </button>
                      <button
                        onClick={() => respond(req.id, 'rejected')}
                        disabled={!!responding[req.id]}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-lg text-xs font-medium transition disabled:opacity-50"
                      >
                        {responding[req.id] === 'rejected'
                          ? <span className="flex items-center gap-1"><Spinner /> Rejecting...</span>
                          : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Sent Requests</h2>
          </div>

          {!requests.outgoing?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm">
              <svg className="w-8 h-8 mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              No sent requests yet
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.outgoing.map(req => (
                <div key={req.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-800 text-sm">
                      {req.target_name || req.target_usn}
                      <span className="text-gray-400 font-normal ml-1.5 text-xs">
                        {req.target_usn}
                      </span>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>
                        Your room: <strong>{req.your_block}-{req.your_room}</strong>
                      </span>
                      <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span>
                        Their room: <strong>{req.their_block}-{req.their_room}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(req.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border
                    ${statusStyle[req.status] || statusStyle.pending}`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}