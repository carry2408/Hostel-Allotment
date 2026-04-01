import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function AllStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')

  const fetchStudents = async () => {
    try {
      const res = await API.get('/admin/students')
      setStudents(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
    const interval = setInterval(fetchStudents, 5000)
    return () => clearInterval(interval)
  }, [])

  const statusStyle = {
    applied:      'bg-yellow-50 text-yellow-600 border-yellow-100',
    allotted:     'bg-green-50 text-green-600 border-green-100',
    not_allotted: 'bg-red-50 text-red-500 border-red-100',
    pending:      'bg-gray-100 text-gray-500 border-gray-200',
  }

  const statusLabel = {
    applied:      'Applied',
    allotted:     'Allotted',
    not_allotted: 'Not Allotted',
    pending:      'Pending',
  }

  const filtered = students.filter(s => {
    const matchSearch =
      s.usn.toLowerCase().includes(search.toLowerCase()) ||
      (s.name  && s.name.toLowerCase().includes(search.toLowerCase())) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || s.status === filter
    return matchSearch && matchFilter
  })

  const stats = {
    total:        students.length,
    applied:      students.filter(s => s.status === 'applied').length,
    allotted:     students.filter(s => s.status === 'allotted').length,
    not_allotted: students.filter(s => s.status === 'not_allotted').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Students</h1>
          <p className="text-sm text-gray-400 mt-1">Live view — refreshes every 5 seconds</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total',        value: stats.total,        color: 'bg-blue-50 text-blue-600 border-blue-100'     },
            { label: 'Applied',      value: stats.applied,      color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
            { label: 'Allotted',     value: stats.allotted,     color: 'bg-green-50 text-green-600 border-green-100'  },
            { label: 'Not Allotted', value: stats.not_allotted, color: 'bg-red-50 text-red-500 border-red-100'        },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-1 opacity-75">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by name, USN or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-72 border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            />
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'applied', 'allotted', 'not_allotted'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border
                    ${filter === f
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300'}`}
                >
                  {f === 'all' ? 'All' : statusLabel[f]}
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
              Loading students...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-medium">#</th>
                    <th className="px-5 py-3 text-left font-medium">Student</th>
                    <th className="px-5 py-3 text-left font-medium">USN</th>
                    <th className="px-5 py-3 text-left font-medium">CGPA</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-600">
                              {(s.name || s.usn).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{s.name || '—'}</p>
                            <p className="text-xs text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-600 text-xs">{s.usn}</td>
                      <td className="px-5 py-3">
                        {s.cgpa ? (
                          <span className="font-semibold text-gray-800">{s.cgpa}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border
                          ${statusStyle[s.status] || statusStyle.pending}`}>
                          {statusLabel[s.status] || 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(s.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
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