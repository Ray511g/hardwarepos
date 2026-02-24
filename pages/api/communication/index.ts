import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission, corsHeaders } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'academic', 'VIEW', res)) return;
        // Mock communications for now or fetch from a table if it exists
        return res.status(200).json([
            { id: '1', type: 'SMS', recipient: 'All Parents', message: 'School reopens on Monday.', date: new Date() },
            { id: '2', type: 'Email', recipient: 'Staff', message: 'Staff meeting at 2 PM.', date: new Date() }
        ]);
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'academic', 'CREATE', res)) return;
        // Logic to "send" communication
        return res.status(201).json({ success: true, message: 'Message queued for sending' });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
