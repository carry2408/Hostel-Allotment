import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      
      <h1 className="text-lg font-bold text-blue-600">
        Hostel Allotment
      </h1>

      <div className="flex items-center gap-4 text-sm">

        {user?.role === 'student' && (
          <>
            <Link to="/student/dashboard">Dashboard</Link>
            <Link to="/student/profile">Profile</Link>
            <Link to="/student/preferences">Preferences</Link>
            <Link to="/student/allotment">Allotment</Link>
            <Link to="/student/swap">Swap</Link>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/rooms">Rooms</Link>
            <Link to="/admin/students">Students</Link>
            <Link to="/admin/allotments">Allotments</Link>
          </>
        )}

        <span className="text-gray-500">
          {user?.usn || user?.username}
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>

      </div>
    </div>
  )
}