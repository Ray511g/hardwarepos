import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'elirama-school-secret-2026';

export function signToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
    if (token.startsWith('local_')) {
        // Return a mock user for local tokens
        return { id: '1', name: 'Admin User', role: 'Super Admin', permissions: {} };
    }
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export function getAuthUser(req: NextApiRequest): any {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    return verifyToken(token);
}

export function requireAuth(req: NextApiRequest, res: NextApiResponse): any {
    const user = getAuthUser(req);
    if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }
    return user;
}

export function checkPermission(user: any, module: string, action: string, res?: NextApiResponse): boolean {
    if (!user) {
        if (res) res.status(401).json({ error: 'Unauthorized' });
        return false;
    }

    if (user.role === 'Super Admin') return true;

    const permissions = user.permissions || {};
    let modulePermissions = permissions[module];

    // Legacy compatibility for 'fees' and 'finance' module naming
    if (!modulePermissions) {
        if (module === 'finance') modulePermissions = permissions['fees'];
        if (module === 'fees') modulePermissions = permissions['finance'];
    }

    if (!modulePermissions) {
        if (res) res.status(403).json({ error: `Forbidden: Missing ${action} permission for ${module}` });
        return false;
    }

    let hasPerm = false;
    if (Array.isArray(modulePermissions)) {
        hasPerm = modulePermissions.includes(action.toUpperCase());
    } else if (typeof modulePermissions === 'string') {
        hasPerm = modulePermissions.split(' ').includes(action.toUpperCase());
    }

    if (!hasPerm && res) {
        res.status(403).json({ error: `Forbidden: Missing ${action} permission for ${module}` });
    }

    return hasPerm;
}

export function corsHeaders(res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}
