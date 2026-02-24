import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission, corsHeaders } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    corsHeaders(res);
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'fees', 'VIEW', res)) return; // Use finance/fees permission for workflow
        const requests = await prisma.approvalRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: { logs: true }
        });
        return res.status(200).json(requests);
    }

    res.status(405).json({ message: 'Method not allowed' });
}
