import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';
import { logAction } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        try {
            const entries = await prisma.journalEntry.findMany({
                include: { account: true },
                orderBy: { date: 'desc' }
            });
            return res.status(200).json(entries);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch journal entries' });
        }
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'finance', 'CREATE', res)) return;
        try {
            const { accountId, description, debit, credit, date, reference } = req.body;

            // Simplified journal posting (could be unbalanced for single manual entries)
            const entry = await prisma.journalEntry.create({
                data: {
                    transactionId: `MANUAL-${Date.now()}`,
                    accountId,
                    description,
                    debit: parseFloat(debit) || 0,
                    credit: parseFloat(credit) || 0,
                    date: date ? new Date(date) : new Date(),
                    reference
                },
                include: { account: true }
            });

            // For manual entries, we might want to update the account balance immediately or wait for approval
            // The current UI shows "Pending approval", but let's implement the logic for Approval too.
            // For now, we update balance if it's a manual override.

            const account = entry.account;
            let balanceChange = 0;
            if (['ASSET', 'EXPENSE'].includes(account.type)) {
                balanceChange = entry.debit - entry.credit;
            } else {
                balanceChange = entry.credit - entry.debit;
            }

            await prisma.account.update({
                where: { id: accountId },
                data: { balance: { increment: balanceChange } }
            });

            await logAction(
                user.id,
                user.name,
                'MANUAL_JOURNAL_ENTRY',
                `Manual entry on ${account.name}: ${description}`,
                { module: 'Finance' }
            );

            return res.status(201).json(entry);
        } catch (error) {
            console.error('JOURNAL POST ERROR:', error);
            return res.status(500).json({ error: 'Failed to post journal entry' });
        }
    }

    // Approval / Reversal could be handled via PUT or sub-routes
    // But SchoolContext expects POST to /journal/approve?id=...
    // We can handle it here if we check the URL.

    return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
