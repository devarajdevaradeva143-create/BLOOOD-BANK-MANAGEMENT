import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: String },
    action: { type: String },
    entity: { type: String },
    entityId: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

auditLogSchema.index({ at: 1 });

export default (
  mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)
);
