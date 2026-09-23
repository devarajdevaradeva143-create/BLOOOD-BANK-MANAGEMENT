const overrides = {
  'chennai|O+': 8,
  'chennai|A+': 12,
  'chennai|B+': 5,
  'madurai|O+': 6,
  'coimbatore|O+': 10,
  'salem|A+': 3,
  'nilgiris|AB-': 0,
  'theni|AB-': 0,
  'pudukkottai|A-': 0,
  'ranipet|B-': 0,
}

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function getAvailableUnits(districtId, bloodGroup) {
  if (!districtId || !bloodGroup) return 0
  const key = `${districtId}|${bloodGroup}`
  if (key in overrides) return overrides[key]
  return hashString(key) % 21
}

export function checkAvailability(districtId, bloodGroup, requiredUnits) {
  const available = getAvailableUnits(districtId, bloodGroup)
  const needed = Number(requiredUnits) || 0
  const isAvailable = needed > 0 ? available >= needed : available > 0
  return { available, required: needed, isAvailable }
}
