import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function AllStudents() {
  const [students, setStudents] = useState([])

  const fetchStudents = async () => {
    try {
      const res = await API.get('/admin/students')
      setStudents(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchStudents()

    const interval = setInterval(fetchStudents, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-yellow-100 text-yellow-700'
      case 'allotted':
        return 'bg-green-100 text-green-700'
      case 'not_allotted':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  return (
    <>
      <Navbar />

      <div className="p-6">

        <h2 className="text-2xl font-bold mb-6 text-blue-600">
          All Students
        </h2>

        <div className="bg-white shadow rounded-xl overflow-hidden">

          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {/* 🔥 NEW */}
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">USN</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">CGPA</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  
                  {/* 🔥 NAME */}
                  <td className="p-3 font-medium text-gray-800">
                    {s.name || '—'}
                  </td>

                  <td className="p-3">{s.usn}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.cgpa || '—'}</td>

                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(s.status)}`}>
                      {s.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>
    </>
  )
}