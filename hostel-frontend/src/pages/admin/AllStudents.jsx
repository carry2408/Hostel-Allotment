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
  // initial load
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchStudents()

  //  auto refresh every 5 sec
  const interval = setInterval(fetchStudents, 5000)

  // cleanup
  return () => clearInterval(interval)

}, [])

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
                <th className="p-3 text-left">USN</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">CGPA</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.usn}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.cgpa || '—'}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-gray-200 rounded text-xs">
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