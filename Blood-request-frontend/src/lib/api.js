const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function req(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

export async function fetchAvailability(districtId, bloodGroup, units) {
  const params = new URLSearchParams()
  if (districtId) params.set('districtId', districtId)
  if (bloodGroup) params.set('bloodGroup', bloodGroup)
  if (units !== undefined && units !== null && String(units) !== '') {
    params.set('units', String(units))
  }
  const qs = params.toString()
  return req(`/api/availability${qs ? `?${qs}` : ''}`)
}

export async function requestOtp(mobile) {
  return req('/api/otp/request', {
    method: 'POST',
    body: JSON.stringify({ mobile, purpose: 'request' }),
  })
}

export async function submitBloodRequest(payload, code) {
  return req('/api/requests', {
    method: 'POST',
    body: JSON.stringify({ ...payload, code }),
  })
}

export { API_BASE }
