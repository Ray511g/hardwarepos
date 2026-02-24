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

        const { type } = req.query;

        try {
            if (type === 'finance') {
                const totalFees = await prisma.student.aggregate({ _sum: { totalFees: true, paidFees: true } });
                const expenses = await prisma.expenditure.findMany({ where: { status: 'PAID' } });
                const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

                return res.status(200).json({
                    totalFees: totalFees._sum.totalFees || 0,
                    paidFees: totalFees._sum.paidFees || 0,
                    balance: (totalFees._sum.totalFees || 0) - (totalFees._sum.paidFees || 0),
                    totalExpenses,
                    net: (totalFees._sum.paidFees || 0) - totalExpenses
                });
            }

            if (type === 'students') {
                const gradeStats = await prisma.student.groupBy({
                    by: ['grade'],
                    _count: { id: true }
                });
                return res.status(200).json(gradeStats);
            }

            return res.status(200).json({ message: 'General report data' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to generate report' });
        }
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
