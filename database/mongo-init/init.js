// mongo-init/init.js — local docker parity for `bloodbank`.
// Mounted to /docker-entrypoint-initdb.d/ by docker-compose.
// Re-runnable: uses createCollection (ignored if exists) + createIndexes.
//
// Mirrors backend/src/models/*.js:
//   users: staffId unique
//   donors: mobile unique + bloodGroup_1_district_1
//   bloodRequests: requestId unique + districtId+bloodGroup+status
//   bloodUnits: unitCode unique + bloodGroup/district/status + expiryDate
//   otps: TTL 300s (createdAt) + expiresAt + targetHash
//   auditLogs: at_1

const DB_NAME = 'bloodbank';

db = db.getSiblingDB(DB_NAME);

// --- collections (no-op if they already exist) ---
for (const name of ['users', 'donors', 'bloodrequests', 'bloodunits', 'otps', 'auditlogs']) {
  try {
    db.createCollection(name);
  } catch (e) {
    // NamespaceExists (48) is fine on re-run.
    if (e && e.code !== 48) throw e;
  }
}

// NOTE: Mongoose uses pluralized physical names:
//   bloodRequests -> bloodrequests, bloodUnits -> bloodunits, auditLogs -> auditlogs.
// Logical aliases keep the docs readable; physical names match the driver.

// --- users ---
db.getCollection('users').createIndexes([
  { key: { staffId: 1 }, name: 'staffId_1', unique: true },
]);

// --- donors ---
db.getCollection('donors').createIndexes([
  { key: { mobile: 1 }, name: 'mobile_1', unique: true },
  { key: { bloodGroup: 1, district: 1 }, name: 'bloodGroup_1_district_1' },
]);

// --- bloodRequests (physical: bloodrequests) ---
db.getCollection('bloodrequests').createIndexes([
  { key: { requestId: 1 }, name: 'requestId_1', unique: true },
  // district+group+status — physical field is districtId (see BloodRequest.js).
  { key: { districtId: 1, bloodGroup: 1, status: 1 }, name: 'districtId_1_bloodGroup_1_status_1' },
]);

// --- bloodUnits (physical: bloodunits) ---
db.getCollection('bloodunits').createIndexes([
  { key: { unitCode: 1 }, name: 'unitCode_1', unique: true },
  { key: { bloodGroup: 1, district: 1, status: 1 }, name: 'bloodGroup_1_district_1_status_1' },
  { key: { expiryDate: 1 }, name: 'expiryDate_1' },
]);

// --- otps ---
db.getCollection('otps').createIndexes([
  { key: { targetHash: 1 }, name: 'targetHash_1' },
  // TTL 300s parity: auto-delete 5 min after creation (OTP window).
  { key: { createdAt: 1 }, name: 'createdAt_1_ttl_300', expireAfterSeconds: 300 },
  // Mirrors Mongoose `expiresAt: { expires: 300 }` (expireAfterSeconds: 0 on expiresAt).
  { key: { expiresAt: 1 }, name: 'expiresAt_1', expireAfterSeconds: 0 },
]);

// --- auditLogs (physical: auditlogs) ---
db.getCollection('auditlogs').createIndexes([
  { key: { at: 1 }, name: 'at_1' },
]);

print(`mongo-init done for db '${DB_NAME}'`);
