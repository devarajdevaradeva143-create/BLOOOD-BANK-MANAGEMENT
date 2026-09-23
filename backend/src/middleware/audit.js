/**
 * Fire-and-forget audit log. Never throws / never blocks the request.
 *
 * @param {string} actorId
 * @param {string} action   e.g. 'donor.create', 'request.approve'
 * @param {string} entity   e.g. 'Donor', 'BloodRequest'
 * @param {string} entityId
 * @param {import('express').Request} [req]
 * @param {object} [meta]
 */
export function logAudit(actorId, action, entity, entityId, req, meta = {}) {
  queueMicrotask(async () => {
    try {
      // AuditLog model is created in a later step; skip silently if absent.
      const { default: AuditLog } = await import('../models/AuditLog.js');
      await AuditLog.create({
        actorId: actorId || null,
        action,
        entity,
        entityId,
        ip: req?.ip,
        userAgent: req?.get?.('user-agent'),
        meta,
      });
    } catch {
      // Intentionally silent — auditing must never break a request.
    }
  });
}

export default logAudit;
