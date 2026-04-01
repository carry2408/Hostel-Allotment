import { useState } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function Profile() {
  const [cgpa, setCgpa]       = useState('')
  const [file, setFile]       = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    const formData = new FormData()
    formData.append('cgpa', cgpa)
    formData.append('document', file)

    try {
      await API.post('/student/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage('Profile updated successfully')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
  <Navbar />

  <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-8">

      <h2 className="text-2xl font-bold text-blue-600 mb-1">
        Student Profile
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Update your academic details
      </p>

      {message && (
        <div className="mb-4 text-sm px-4 py-2 rounded-lg bg-blue-100 text-blue-600">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CGPA
          </label>
          <input
            type="number"
            step="0.01"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            placeholder="Enter your CGPA"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Result (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {loading ? 'Uploading...' : 'Save Profile'}
        </button>

      </form>

    </div>
  </div>
</>
  )
}