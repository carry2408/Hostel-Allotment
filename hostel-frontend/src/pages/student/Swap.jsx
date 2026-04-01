import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function Swap() {
  const [usn, setUsn] = useState('')
  const [message, setMessage] = useState('')
  const [requests, setRequests] = useState([])

  // 🔥 Fetch incoming swap requests
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await API.get('/student/swap/requests')
      setRequests(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  // 🔥 Send request
  const requestSwap = async () => {
    if (!usn) {
      setMessage('Enter USN')
      return
    }

    try {
      await API.post('/student/swap/request', {
        target_usn: usn
      })
      setMessage('Swap request sent')
      setUsn('')
      fetchRequests()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error')
    }
  }

  // 🔥 Respond to request
  const respond = async (id, action) => {
    try {
      await API.put(`/student/swap/${id}/respond`, { action })
      setMessage(`Request ${action}`)
      fetchRequests()
    } catch (err) {
      setMessage('Error processing request' + err)
    }
  }

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* 🔵 REQUEST SWAP */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">
            Request Room Swap
          </h2>

          <input
            type="text"
            placeholder="Enter target student USN"
            value={usn}
            onChange={(e) => setUsn(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          />

          <button
            onClick={requestSwap}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Send Request
          </button>
        </div>

        {/* 🟢 INCOMING REQUESTS */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">
            Incoming Requests
          </h2>

          {requests.length === 0 && (
            <p className="text-gray-500 text-sm">
              No swap requests
            </p>
          )}

          <div className="space-y-3">
            {requests.map(req => (
              <div
                key={req.id}
                className="p-3 border rounded flex justify-between items-center"
              >
                <span>
                  {req.requester_usn} wants to swap
                  <br />
                  Their Room: {req.requester_block}-{req.requester_room}
                  <br />
                  Your Room: {req.your_block}-{req.your_room}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => respond(req.id, 'accepted')}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => respond(req.id, 'rejected')}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🔵 MESSAGE */}
        {message && (
          <p className="text-sm text-blue-600 text-center">
            {message}
          </p>
        )}

      </div>
    </>
  )
}