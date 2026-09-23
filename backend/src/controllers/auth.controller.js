import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import { comparePin } from '../utils/passwords.js';
import {
  signAccess,
  signRefresh,
  setRefreshCookie,
  clearRefreshCookie,
} from '../utils/jwt.js';
import { hashValue } from '../utils/otp.js';
import { config } from '../config/env.js';
import { logAudit } from '../middleware/audit.js';

const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

function toSafeUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    staffId: user.staffId,
    name: user.name,
    role: user.role,
    designation: user.designation || null,
    active: user.active,
  };
}

function pruneExpiredTokens(user) {
  const now = new Date();
  user.refreshTokens = (user.refreshTokens || []).filter(
    (t) => t && t.expiresAt && new Date(t.expiresAt) > now
  );
}

/**
 * POST /api/auth/login
 * Body: { staffId, pin }
 */
export const login = asyncHandler(async (req, res) => {
  const { staffId, pin } = req.body;
  const normalizedId = String(staffId || '').trim().toUpperCase();

  const user = await User.findOne({ staffId: normalizedId });
  if (!user || user.active === false) {
    return res.status(401).json({ message: 'Invalid staff ID or PIN' });
  }

  const ok = await comparePin(pin, user.pinHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid staff ID or PIN' });
  }

  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  const tokenHash = hashValue(refreshToken);

  pruneExpiredTokens(user);
  user.refreshTokens.push({
    tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
  });
  await user.save();

  setRefreshCookie(res, refreshToken);
  logAudit(String(user._id), 'auth.login', 'User', String(user._id), req);

  return res.status(200).json({ user: toSafeUser(user), accessToken });
});

/**
 * POST /api/auth/refresh
 * Reads refreshToken cookie, rotates it, returns new access token.
 */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwt.refreshSecret);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }

  const tokenHash = hashValue(token);
  const user = await User.findOne({
    _id: payload.id,
    'refreshTokens.tokenHash': tokenHash,
  });
  if (!user || user.active === false) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  // Rotate: drop the used token, prune expired, push replacement.
  user.refreshTokens = (user.refreshTokens || []).filter(
    (t) => t.tokenHash !== tokenHash && new Date(t.expiresAt) > new Date()
  );

  const accessToken = signAccess(user);
  const nextRefresh = signRefresh(user);
  user.refreshTokens.push({
    tokenHash: hashValue(nextRefresh),
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
  });
  await user.save();

  setRefreshCookie(res, nextRefresh);
  return res.status(200).json({ user: toSafeUser(user), accessToken });
});

/**
 * POST /api/auth/logout
 * Clears cookie + pulls the presented refresh token.
 */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret);
      await User.updateOne(
        { _id: payload.id },
        { $pull: { refreshTokens: { tokenHash: hashValue(token) } } }
      );
    } catch {
      // Token already invalid/expired — still clear the cookie below.
      // Best-effort pull by hash even without a valid payload.
      try {
        await User.updateMany(
          { 'refreshTokens.tokenHash': hashValue(token) },
          { $pull: { refreshTokens: { tokenHash: hashValue(token) } } }
        );
      } catch {
        // ignore
      }
    }
  }

  clearRefreshCookie(res);
  return res.status(200).json({ message: 'Logged out' });
});

/**
 * GET /api/auth/me
 */
export const me = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    return res.status(200).json({ user: req.user || null });
  }
  const user = await User.findById(req.user.id).select('-pinHash -refreshTokens');
  if (!user) {
    return res.status(200).json({ user: req.user });
  }
  return res.status(200).json({ user: toSafeUser(user) });
});

export default { login, refresh, logout, me };
