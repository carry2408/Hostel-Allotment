import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className="font-bold text-gray-800 text-sm">MSRIT Hostel</span>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin ? (
            <>
              <Link to="/admin/dashboard"  className="text-sm text-gray-500 hover:text-blue-600 transition">Dashboard</Link>
              <Link to="/admin/rooms"      className="text-sm text-gray-500 hover:text-blue-600 transition">Rooms</Link>
              <Link to="/admin/students"   className="text-sm text-gray-500 hover:text-blue-600 transition">Students</Link>
              <Link to="/admin/allotments" className="text-sm text-gray-500 hover:text-blue-600 transition">Allotments</Link>
            </>
          ) : (
            <>
              <Link to="/student/dashboard"   className="text-sm text-gray-500 hover:text-blue-600 transition">Home</Link>
              <Link to="/student/profile"     className="text-sm text-gray-500 hover:text-blue-600 transition">Profile</Link>
              <Link to="/student/preferences" className="text-sm text-gray-500 hover:text-blue-600 transition">Preferences</Link>
              <Link to="/student/allotment"   className="text-sm text-gray-500 hover:text-blue-600 transition">Allotment</Link>
              <Link to="/student/swap"        className="text-sm text-gray-500 hover:text-blue-600 transition">Swap</Link>
            </>
          )}

          <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">
                {isAdmin ? 'A' : user?.usn?.charAt(0) || 'S'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-600 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>

      </div>
    </nav>
  )
}