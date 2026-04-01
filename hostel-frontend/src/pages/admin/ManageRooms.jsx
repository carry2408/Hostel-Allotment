/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api/axios'

export default function ManageRooms() {
  const [rooms, setRooms] = useState([])
  const [form, setForm] = useState({
    block: 'R',
    room_number: '',
    type: 'single',
    fee: '',
    capacity: 1
  })

  const fetchRooms = async () => {
    try {
      const res = await API.get('/admin/rooms')
      setRooms(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAdd = async () => {
    try {
      await API.post('/admin/rooms', form)
      fetchRooms()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/rooms/${id}`)
      fetchRooms()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <Navbar />

      <div className="p-6 grid grid-cols-2 gap-6">

        {/* Add Room */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Add Room</h2>

          <div className="space-y-3">

            <select name="block" onChange={handleChange} className="w-full border p-2">
              <option value="R">R</option>
              <option value="S">S</option>
              <option value="N">N</option>
              <option value="G">G</option>
            </select>

            <input
              name="room_number"
              placeholder="Room Number"
              onChange={handleChange}
              className="w-full border p-2"
            />

            <select name="type" onChange={handleChange} className="w-full border p-2">
              <option value="single">Single</option>
              <option value="double">Double</option>
            </select>

            <input
              name="fee"
              placeholder="Fee"
              onChange={handleChange}
              className="w-full border p-2"
            />

            <select name="capacity" onChange={handleChange} className="w-full border p-2">
              <option value="1">1</option>
              <option value="2">2</option>
            </select>

            <button
              onClick={handleAdd}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Add Room
            </button>

          </div>
        </div>

        {/* Room List */}
        <div>
          <h2 className="text-xl font-bold mb-4">All Rooms</h2>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">

            {rooms.map(room => (
              <div
                key={room.id}
                className="p-3 bg-white shadow rounded flex justify-between items-center"
              >
                <span>
                  {room.block}-{room.room_number} ({room.type})
                </span>

                <button
                  onClick={() => handleDelete(room.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            ))}

          </div>
        </div>

      </div>
    </>
  )
}