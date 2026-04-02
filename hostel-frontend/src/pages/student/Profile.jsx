import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function Profile() {
  const [name, setName]       = useState('')
  const [cgpa, setCgpa]       = useState('')
  const [file, setFile]       = useState(null)
  const [existing, setExisting] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  useEffect(() => {
    API.get('/student/profile')
      .then(res => {
        setExisting(res.data)
        setName(res.data.name || '')
        setCgpa(res.data.cgpa || '')
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cgpa < 0 || cgpa > 10) {
      showMessage('CGPA must be between 0 and 10.', 'error')
      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('cgpa', cgpa)
    if (file) formData.append('document', file)

    try {
      await API.post('/student/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      showMessage('Profile updated successfully.')
      API.get('/student/profile').then(res => setExisting(res.data))
    } catch (err) {
      showMessage(err.response?.data?.message || 'Update failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  )

  const inputClass = "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Update your academic details before the deadline</p>
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

        {existing && !fetching && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Current Info</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Name',   value: existing.name  || '—' },
                { label: 'USN',    value: existing.usn        },
                { label: 'Email',  value: existing.email      },
                { label: 'CGPA',   value: existing.cgpa  || '—' },
                { label: 'Status', value: existing.status     },
                { label: 'Document', value: existing.doc_url ? 'Uploaded' : 'Not uploaded' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{item.value}</p>
                </div>
              ))}
            </div>
            {existing.doc_url && (
              <a
                href={`http://localhost:5000${existing.doc_url}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View uploaded document
              </a>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-700 text-sm mb-5">Update Profile</h3>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={e => setCgpa(e.target.value)}
                placeholder="e.g. 8.75"
                required
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">Must be between 0.00 and 10.00</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Result Document (PDF)
              </label>
              <div className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setFile(e.target.files[0])}
                  className="w-full text-gray-500 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                />
              </div>
              {existing?.doc_url && (
                <p className="text-xs text-gray-400 mt-1">
                  A document is already uploaded. Upload a new one to replace it.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><Spinner /> Saving...</span>
                : 'Save Profile'}
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}