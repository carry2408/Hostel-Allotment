import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function AllAllotments() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  const fetchAllotments = async () => {
    try {
      const res = await API.get('/admin/allotments')
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatFee = (fee) => {
  const n = parseFloat(fee)
  return isNaN(n) ? '—' : `₹${n.toLocaleString('en-IN')}`
}

  useEffect(() => {
    fetchAllotments()
    const interval = setInterval(fetchAllotments, 5000)
    return () => clearInterval(interval)
  }, [])

  const filtered = data.filter(item =>
    item.usn.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total:    data.length,
    round1:   data.filter(d => d.round === 'round1').length,
    round2:   data.filter(d => d.round === 'round2').length,
    onHold:   data.filter(d => d.is_on_hold).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Allotments</h1>
          <p className="text-sm text-gray-400 mt-1">Live view — refreshes every 5 seconds</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Allotted', value: stats.total,  color: 'bg-blue-50 text-blue-600 border-blue-100'   },
            { label: 'Round 1',        value: stats.round1, color: 'bg-green-50 text-green-600 border-green-100' },
            { label: 'Round 2',        value: stats.round2, color: 'bg-purple-50 text-purple-600 border-purple-100' },
            { label: 'On Hold',        value: stats.onHold, color: 'bg-amber-50 text-amber-600 border-amber-100' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-1 opacity-75">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search by USN or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-72 border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Loading allotments...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No allotments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-medium">#</th>
                    <th className="px-5 py-3 text-left font-medium">Student</th>
                    <th className="px-5 py-3 text-left font-medium">CGPA</th>
                    <th className="px-5 py-3 text-left font-medium">Room</th>
                    <th className="px-5 py-3 text-left font-medium">Type</th>
                    <th className="px-5 py-3 text-left font-medium">Fee</th>
                    <th className="px-5 py-3 text-left font-medium">Round</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800">{item.usn}</p>
                        <p className="text-xs text-gray-400">{item.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-gray-700">{item.cgpa}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-gray-800">
                          {item.block}-{item.room_number}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium
                          ${item.type === 'single'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-purple-50 text-purple-600'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {formatFee(item.fee)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium
                          ${item.round === 'round1'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-amber-50 text-amber-600'}`}>
                          {item.round === 'round1' ? 'Round 1' : 'Round 2'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium
                          ${item.is_on_hold
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-green-50 text-green-600'}`}>
                          {item.is_on_hold ? 'On Hold' : 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}