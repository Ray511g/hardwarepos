import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';
import { touchSync } from '../../../lib/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Require High-level permission
    if (user.role !== 'Principal' && user.role !== 'Super Admin') {
        return res.status(403).json({ error: 'Unauthorized: Principal authority required' });
    }

    try {
        await prisma.$transaction([
            prisma.attendance.deleteMany(),
            prisma.result.deleteMany(),
            prisma.payment.deleteMany(),
            prisma.expenseRequest.deleteMany(),
            prisma.journalEntry.deleteMany(),
            prisma.auditLog.deleteMany(),
            prisma.payrollEntry.deleteMany(),
            prisma.creditAgreement.deleteMany(),
            prisma.promissoryNote.deleteMany(),
            prisma.purchaseOrder.deleteMany(),
            prisma.schoolServiceOrder.deleteMany(),
            prisma.inventoryTransaction.deleteMany(),
            prisma.libraryBorrow.deleteMany(),
            // Re-zeroing Finance Accounts
            prisma.account.updateMany({
                data: { balance: 0 }
            })
        ]);

        await touchSync();

        return res.status(200).json({
            success: true,
            message: 'Dashboard and activity figures have been reset to zero successfully.'
        });
    } catch (error: any) {
        console.error('Reset Dashboard Error:', error);
        return res.status(500).json({
            error: 'Failed to reset dashboard figures',
            details: error.message
        });
    }
}
