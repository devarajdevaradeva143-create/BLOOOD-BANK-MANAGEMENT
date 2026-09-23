import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Verify access JWT from `Authorization: Bearer <token>`
 * or `accessToken` cookie. Attaches `req.user = { id, role, ... }`.
 */
export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  const token = bearer || req.cookies?.accessToken || null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: missing access token' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized: invalid or expired token' });
  }
}

// Alias kept for shorter imports: `import { auth } from ...`
export const auth = authRequired;

export default authRequired;
