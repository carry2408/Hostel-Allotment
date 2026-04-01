import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

export default function Login({ isAdmin }) {
  const [form, setForm]       = useState({ usn: '', username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isAdmin) {
        const res = await API.post('/auth/admin/login', {
          username: form.username,
          password: form.password,
        })
        login({ username: form.username, role: 'admin' }, res.data.token)
        navigate('/admin/dashboard')
      } else {
        const res = await API.post('/auth/login', {
          usn:      form.usn,
          password: form.password,
        })
        login({ ...res.data.student, role: 'student' }, res.data.token)
        navigate('/student/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Hostel Allotment</h1>
          <p className="text-gray-500 text-sm mt-1">MSRIT — Boys Hostel Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">
            {isAdmin ? 'Admin Sign In' : 'Student Sign In'}
          </h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isAdmin ? (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter admin username"
                  required
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  USN
                </label>
                <input
                  type="text"
                  name="usn"
                  value={form.usn}
                  onChange={handleChange}
                  placeholder="e.g. 1MS24CS001"
                  required
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium text-sm transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {!isAdmin && (
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-center text-sm text-gray-500">
              <p>
                No account yet?{' '}
                <Link to="/register" className="text-blue-600 font-medium hover:underline">
                  Register here
                </Link>
              </p>
              <p>
                Are you an admin?{' '}
                <Link to="/admin/login" className="text-blue-600 font-medium hover:underline">
                  Admin login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}