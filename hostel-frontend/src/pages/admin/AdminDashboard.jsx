import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'
import Navbar from '../../components/Navbar'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [message, setMessage]   = useState({ text: '', type: '' })
  const [loading, setLoading]   = useState({})

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handle = (key, fn) => async () => {
    setLoading(l => ({ ...l, [key]: true }))
    try {
      await fn()
    } finally {
      setLoading(l => ({ ...l, [key]: false }))
    }
  }

  const openApplications = handle('openApp', async () => {
    await API.post('/admin/applications/open')
    showMessage('Applications are now open for students.', 'success')
  })

  const closeApplications = handle('closeApp', async () => {
    await API.post('/admin/applications/close')
    showMessage('Applications closed. Round 1 allotment completed.', 'success')
  })

  const openRound2 = handle('openR2', async () => {
    await API.post('/admin/round2/open')
    showMessage('Round 2 upgrade window is now open.', 'success')
  })

  const closeRound2 = handle('closeR2', async () => {
    await API.post('/admin/round2/close')
    showMessage('Round 2 closed. All allotments are final.', 'success')
  })

  const controls = [
    {
      section: 'Round 1 — Applications',
      description: 'Open the portal for students to submit preferences, then close to trigger allotment.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'blue',
      actions: [
        { label: 'Open Applications', key: 'openApp',  fn: openApplications, color: 'green' },
        { label: 'Close & Run Allotment', key: 'closeApp', fn: closeApplications, color: 'red'   },
      ]
    },
    {
      section: 'Round 2 — Upgrades & Swaps',
      description: 'Allow students to upgrade rooms or request mutual swaps, then lock final allotments.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: 'purple',
      actions: [
        { label: 'Open Round 2',    key: 'openR2',  fn: openRound2,  color: 'blue'  },
        { label: 'Lock All Allotments', key: 'closeR2', fn: closeRound2, color: 'gray'  },
      ]
    },
  ]

  const navCards = [
    {
      label: 'Manage Rooms',
      desc:  'Add or remove hostel rooms',
      to:    '/admin/rooms',
      color: 'bg-blue-50 border-blue-100',
      icon:  (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      label: 'All Students',
      desc:  'View student applications',
      to:    '/admin/students',
      color: 'bg-green-50 border-green-100',
      icon:  (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      label: 'All Allotments',
      desc:  'View final room assignments',
      to:    '/admin/allotments',
      color: 'bg-purple-50 border-purple-100',
      icon:  (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
  ]

  const btnColor = {
    green: 'bg-green-600 hover:bg-green-700',
    red:   'bg-red-500 hover:bg-red-600',
    blue:  'bg-blue-600 hover:bg-blue-700',
    gray:  'bg-gray-600 hover:bg-gray-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.username} — MSRIT Hostel Management</p>
        </div>

        {message.text && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border
            ${message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'}`}>
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'success'
                ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                : <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />}
            </svg>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {navCards.map(card => (
            <Link key={card.to} to={card.to}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${card.color} hover:shadow-md transition`}>
              <div className="shrink-0">{card.icon}</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{card.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {controls.map(ctrl => (
          <div key={ctrl.section} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className={`text-${ctrl.color}-500`}>{ctrl.icon}</div>
              <h3 className="font-semibold text-gray-800">{ctrl.section}</h3>
            </div>
            <p className="text-sm text-gray-400 mb-5">{ctrl.description}</p>
            <div className="grid grid-cols-2 gap-3">
              {ctrl.actions.map(action => (
                <button
                  key={action.key}
                  onClick={action.fn}
                  disabled={loading[action.key]}
                  className={`${btnColor[action.color]} text-white py-2.5 px-4 rounded-xl text-sm font-medium transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading[action.key] ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Working...
                    </span>
                  ) : action.label}
                </button>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}