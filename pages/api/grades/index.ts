import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission, corsHeaders } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'exams', 'VIEW', res)) return;
        const results = await prisma.result.findMany({
            include: { student: true, exam: true }
        });
        return res.status(200).json(results);
    }

    res.status(405).json({ message: 'Method not allowed' });
}
