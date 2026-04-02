import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'

export default function Dashboard() {
  const { user }          = useAuth()
  const [profile, setProfile] = useState(null)
  const [allotment, setAllotment] = useState(null)

  useEffect(() => {
    API.get('/student/profile').then(r => setProfile(r.data)).catch(() => {})
    API.get('/student/allotment').then(r => setAllotment(r.data)).catch(() => {})
  }, [])

  const statusStyle = {
    pending:      { bg: 'bg-gray-100',   text: 'text-gray-500',  label: 'Pending'      },
    applied:      { bg: 'bg-yellow-50',  text: 'text-yellow-600',label: 'Applied'      },
    allotted:     { bg: 'bg-green-50',   text: 'text-green-600', label: 'Allotted'     },
    not_allotted: { bg: 'bg-red-50',     text: 'text-red-500',   label: 'Not Allotted' },
  }

  const s = statusStyle[profile?.status] || statusStyle.pending

  const formatFee = (fee) => {
  const n = parseFloat(fee)
  return isNaN(n) ? '—' : `₹${n.toLocaleString('en-IN')}`
}
  const steps = [
    {
      label:    'Update Profile',
      desc:     'Submit your CGPA and result document',
      to:       '/student/profile',
      done:     !!profile?.cgpa && !!profile?.doc_url,
      color:    'blue',
    },
    {
      label:    'Submit Preferences',
      desc:     'Choose up to 10 room preferences',
      to:       '/student/preferences',
      done:     profile?.status === 'applied' || profile?.status === 'allotted',
      color:    'purple',
    },
    {
      label:    'View Allotment',
      desc:     'Check your assigned room',
      to:       '/student/allotment',
      done:     profile?.status === 'allotted',
      color:    'green',
    },
    {
      label:    'Swap Room',
      desc:     'Request a mutual room swap',
      to:       '/student/swap',
      done:     false,
      color:    'amber',
    },
  ]

  const blockColor = {
    R: 'bg-blue-100 text-blue-600',
    S: 'bg-purple-100 text-purple-600',
    N: 'bg-green-100 text-green-600',
    G: 'bg-amber-100 text-amber-600',
  }

  const iconColor = {
    blue:   'bg-blue-50 text-blue-500',
    purple: 'bg-purple-50 text-purple-500',
    green:  'bg-green-50 text-green-500',
    amber:  'bg-amber-50 text-amber-500',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs font-medium mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold text-white">{profile?.name || user?.usn}</h1>
            <p className="text-blue-100 text-sm mt-0.5">{user?.usn} — MSRIT Boys Hostel</p>
          </div>
          <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {(profile?.name || user?.usn || 'S').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Status',
              value: s.label,
              extra: `${s.bg} ${s.text}`,
            },
            {
              label: 'CGPA',
              value: profile?.cgpa || '—',
              extra: 'bg-blue-50 text-blue-600',
            },
            {
              label: 'Room',
              value: allotment ? `${allotment.block}-${allotment.room_number}` : '—',
              extra: allotment ? (blockColor[allotment.block] || 'bg-gray-100 text-gray-500') : 'bg-gray-100 text-gray-400',
            },
            {
              label: 'Round',
              value: allotment ? (allotment.round === 'round1' ? 'Round 1' : 'Round 2') : '—',
              extra: 'bg-purple-50 text-purple-600',
            },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl p-4 ${card.extra}`}>
              <p className="text-xl font-bold">{card.value}</p>
              <p className="text-xs font-medium mt-1 opacity-70">{card.label}</p>
            </div>
          ))}
        </div>

        {allotment && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-700 text-sm">Your Allotted Room</h2>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold
                  ${blockColor[allotment.block] || 'bg-gray-100 text-gray-500'}`}>
                  {allotment.block}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {allotment.block}-{allotment.room_number}
                  </p>
                  <p className="text-xs text-gray-400">
                    {allotment.type} · {formatFee(allotment.fee)}
                  </p>
                </div>
              </div>
              <Link
                to="/student/allotment"
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                View details →
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-700 text-sm">Quick Actions</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {steps.map(step => (
              <Link
                key={step.to}
                to={step.to}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                    ${step.done ? 'bg-green-100 text-green-500' : iconColor[step.color]}`}>
                    {step.done ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}