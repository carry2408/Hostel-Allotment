import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function AllAllotments() {
  const [data, setData] = useState([])

const fetchAllotments = async () => {
  try {
    const res = await API.get('/admin/allotments')
    setData(res.data)
  } catch (err) {
    console.error(err)
  }
}

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchAllotments()

  const interval = setInterval(fetchAllotments, 5000)

  return () => clearInterval(interval)
}, [])

  return (
    <>
      <Navbar />

      <div className="p-6">

        <h2 className="text-2xl font-bold mb-6 text-blue-600">
          All Allotments
        </h2>

        <div className="bg-white shadow rounded-xl overflow-hidden">

          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">USN</th>
                <th className="p-3 text-left">Room</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Round</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.usn}</td>
                  <td className="p-3">
                    {item.block}-{item.room_number}
                  </td>
                  <td className="p-3">{item.type}</td>
                  <td className="p-3">{item.round}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-gray-200 rounded text-xs">
                      {item.is_on_hold ? 'On Hold' : 'Confirmed'}
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