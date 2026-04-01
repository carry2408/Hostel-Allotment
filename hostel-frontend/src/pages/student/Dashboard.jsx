import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <>
      <Navbar />

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          Welcome {user?.usn}
        </h2>

        <div className="bg-white p-4 rounded-xl shadow">
          <p>Status: <strong>{user?.status}</strong></p>
          <p>CGPA: {user?.cgpa || 'Not submitted'}</p>
        </div>
      </div>
    </>
  )
}