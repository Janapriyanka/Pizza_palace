import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * JWT_SECRET - The signing secret for JSON Web Tokens.
 *
 * In production this MUST be set via the VERCEL/environment secret manager
 * (process.env.JWT_SECRET). The fallback value here is only safe for local
 * development — never ship a hardcoded secret to production.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'pizza_palace_super_secret_key_123';

/**
 * AuthenticatedRequest - Extended Express Request type.
 *
 * After `verifyToken` successfully validates the JWT, it attaches
 * the decoded user payload here so downstream route handlers can
 * safely read `req.user` without re-decoding the token.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;    // MongoDB _id of the user (as a string)
    email: string; // User's email address from the token claims
    role: 'customer' | 'owner' | 'admin'; // Access level
  };
}

/**
 * verifyToken - Express middleware that authenticates incoming requests.
 *
 * Flow:
 * 1. Reads the "Authorization: Bearer <token>" header.
 * 2. If no token is present → 401 Unauthorized.
 * 3. Verifies the token signature and expiry using JWT_SECRET.
 * 4. If valid → attaches decoded payload to req.user and calls next().
 * 5. If invalid/expired → 401 Unauthorized.
 *
 * Used as a guard on any route that requires the user to be logged in.
 */
export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Extract the Authorization header value
  const authHeader = req.headers['authorization'];
  // Tokens are sent as "Bearer eyJhbGc..." — split on space and take index [1]
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided at all — reject immediately
    res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
    return;
  }

  try {
    // Verify signature and decode payload in one step
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'customer' | 'owner' | 'admin';
    };
    // Attach user data to the request so route handlers can use it
    req.user = decoded;
    next(); // Proceed to the actual route handler
  } catch (error) {
    // Token is malformed, expired, or signed with the wrong secret
    res.status(401).json({ success: false, message: 'Authentication token is invalid or expired.' });
  }
}

/**
 * isAdmin - Express middleware that enforces admin/owner role access.
 *
 * Must be placed AFTER verifyToken in the middleware chain since it
 * depends on req.user being populated.
 *
 * Only users with role 'admin' or 'owner' can pass this guard.
 * Regular 'customer' accounts receive a 403 Forbidden response.
 *
 * Used on pizza CRUD (POST/PUT/DELETE /api/pizzas) routes to restrict
 * menu management to restaurant staff only.
 */
export function isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    // verifyToken should have caught this, but guard defensively
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const role = req.user.role;
  if (role !== 'admin' && role !== 'owner') {
    // Authenticated but not privileged
    res.status(403).json({ success: false, message: 'Access denied. Elevated administrative role required.' });
    return;
  }

  next(); // User is admin/owner — allow through
}
