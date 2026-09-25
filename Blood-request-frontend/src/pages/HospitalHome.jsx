import { useState } from 'react'
import { Building2, LogOut, Mail, MapPin, Phone, ReceiptText } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'

const HospitalHome = ({ onLogout }) => {
  const isLoggedIn = localStorage.getItem('hospitalLoggedIn') === 'true'
  const [hospital] = useState(() =>
    JSON.parse(localStorage.getItem('registeredHospital') || 'null')
  )

  if (!isLoggedIn) {
    return <Navigate to="/hospital/login" replace />
  }

  const details = [
    { icon: Building2, label: 'Hospital Name', value: hospital?.hospitalName },
    {
      icon: ReceiptText,
      label: 'Registration No.',
      value: hospital?.registrationNumber,
    },
    { icon: Mail, label: 'Email', value: hospital?.email },
    { icon: Phone, label: 'Phone', value: hospital?.phone },
    { icon: MapPin, label: 'Address', value: hospital?.address },
  ].filter((item) => item.value)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7f8] via-white to-[#fff1f3] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[560px]">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_35px_rgba(15,23,42,0.08)] px-6 sm:px-9 py-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                <Building2 size={26} className="text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mt-3">
            <h2 className="text-[25px] font-bold text-[#102a43]">
              Welcome{hospital?.hospitalName ? `, ${hospital.hospitalName}` : ''}
            </h2>

            <p className="text-[13px] text-[#627b95] mt-1">
              You are signed in to the hospital blood request portal
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {details.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
              >
                <div className="w-8 h-8 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                  <Icon size={16} className="text-red-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#17324d]">
                    {label}
                  </p>

                  <p className="text-[12px] text-[#526b87] truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/request"
            className="mt-6 w-full h-10 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition shadow-md shadow-red-100"
          >
            Request Blood
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="mt-3 w-full h-10 rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50 font-semibold text-[14px] flex items-center justify-center gap-2 transition"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default HospitalHome
