import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Login       from './pages/Login'
import Register    from './pages/Register'
import Dashboard   from './pages/student/Dashboard'
import Profile     from './pages/student/Profile'
import Preferences from './pages/student/Preferences'
import Allotment   from './pages/student/Allotment'
import Swap        from './pages/student/Swap'

import AdminDashboard  from './pages/admin/AdminDashboard'
import ManageRooms     from './pages/admin/ManageRooms'
import AllStudents     from './pages/admin/AllStudents'
import AllAllotments   from './pages/admin/AllAllotments'

const StudentRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'student') return <Navigate to="/login" />
  return children
}

const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/admin/login" />
  if (user.role !== 'admin') return <Navigate to="/admin/login" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Navigate to="/login" />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/admin/login"  element={<Login isAdmin />} />

        <Route path="/student/dashboard"   element={<StudentRoute><Dashboard /></StudentRoute>} />
        <Route path="/student/profile"     element={<StudentRoute><Profile /></StudentRoute>} />
        <Route path="/student/preferences" element={<StudentRoute><Preferences /></StudentRoute>} />
        <Route path="/student/allotment"   element={<StudentRoute><Allotment /></StudentRoute>} />
        <Route path="/student/swap"        element={<StudentRoute><Swap /></StudentRoute>} />

        <Route path="/admin/dashboard"    element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/rooms"        element={<AdminRoute><ManageRooms /></AdminRoute>} />
        <Route path="/admin/students"     element={<AdminRoute><AllStudents /></AdminRoute>} />
        <Route path="/admin/allotments"   element={<AdminRoute><AllAllotments /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App