import Navbar from '../../components/Navbar'
import API from '../../api/axios'
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [message, setMessage] = useState('')
  const [year, setYear] = useState('')
  const [newYear, setNewYear] = useState('')

  const fetchYear = async () => {
    try {
      const res = await API.get('/admin/year')
      setYear(res.data.year)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchYear()

    const interval = setInterval(fetchYear, 5000)

    return () => clearInterval(interval)
  }, [])

  const openApplications = async () => {
    try {
      await API.post('/admin/applications/open')
      setMessage('Applications opened')
    } catch {
      setMessage('Error opening applications')
    }
  }

  const closeApplications = async () => {
    try {
      await API.post('/admin/applications/close')
      setMessage('Applications closed & allotment done')
    } catch {
      setMessage('Error closing applications')
    }
  }

  const openRound2 = async () => {
    try {
      await API.post('/admin/round2/open')
      setMessage('Round 2 opened')
    } catch {
      setMessage('Error opening round 2')
    }
  }

  const closeRound2 = async () => {
    try {
      await API.post('/admin/round2/close')
      setMessage('Round 2 closed')
    } catch {
      setMessage('Error closing round 2')
    }
  }

  const startNewYear = async () => {
    try {
      await API.post('/admin/year/start', { year: newYear })
      setYear(newYear)
      setMessage(`New academic year ${newYear} started`)
      setNewYear('')
    } catch {
      setMessage('Error starting new year')
    }
  }

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-xl mx-auto space-y-6">

        {/*  Current Year */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold text-blue-600">
            Academic Year: {year || 'Loading...'}
          </h2>
        </div>

        {/*  Start New Year */}
        <div className="bg-white p-4 rounded shadow space-y-3">
          <h3 className="font-semibold">Start New Academic Year</h3>

          <input
            type="text"
            placeholder="Enter year (e.g. 2026)"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <button
            onClick={startNewYear}
            className="w-full bg-purple-600 text-white py-2 rounded"
          >
            Start New Year
          </button>
        </div>

        {/*  Controls */}
        <div className="bg-white p-4 rounded shadow space-y-3">
          <h3 className="font-semibold">Application Control</h3>

          <button
            onClick={openApplications}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Open Applications
          </button>

          <button
            onClick={closeApplications}
            className="w-full bg-red-600 text-white py-2 rounded"
          >
            Close Applications
          </button>
        </div>

        {/*  Round 2 */}
        <div className="bg-white p-4 rounded shadow space-y-3">
          <h3 className="font-semibold">Round 2 Control</h3>

          <button
            onClick={openRound2}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Open Round 2
          </button>

          <button
            onClick={closeRound2}
            className="w-full bg-gray-600 text-white py-2 rounded"
          >
            Close Round 2
          </button>
        </div>
        <button
          onClick={async () => {
            if (!confirm('This will backup and DELETE all data. Continue?')) return;

            try {
              const res = await API.post('/admin/export-reset')
              alert(res.data.message + '\nFile: ' + res.data.file)
            } catch (err) {
              alert('Error exporting data' + err)
            }
          }}
          className="w-full bg-red-700 text-white py-2 rounded"
        >
          Export & Reset System
        </button>

        {/*  Message */}
        {message && (
          <p className="text-sm text-blue-600 text-center">{message}</p>
        )}

      </div>
    </>
  )
}