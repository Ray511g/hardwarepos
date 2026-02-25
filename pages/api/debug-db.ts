
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const counts = {
            users: await prisma.user.count(),
            students: await prisma.student.count(),
            accounts: await prisma.account.count(),
            journalEntries: await prisma.journalEntry.count(),
            expenseRequests: await prisma.expenseRequest.count(),
            budgets: await prisma.budget.count(),
            payrollEntries: await prisma.payrollEntry.count(),
            purchaseOrders: await prisma.purchaseOrder.count(),
            serviceOrders: await prisma.schoolServiceOrder.count(),
        };

        const samples = {
            purchaseOrders: await prisma.purchaseOrder.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
            serviceOrders: await prisma.schoolServiceOrder.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
        };

        res.status(200).json({
            timestamp: new Date().toISOString(),
            counts,
            samples
        });
    } catch (error: any) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
}
