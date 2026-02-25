import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../../lib/auth';
import { logAction } from '../../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!checkPermission(user, 'finance', 'EDIT', res)) return;

    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'Journal entry ID is required' });

        const original = await prisma.journalEntry.findUnique({
            where: { id },
            include: { account: true }
        });

        if (!original) return res.status(404).json({ error: 'Original entry not found' });
        if (original.status === 'Reversed') return res.status(400).json({ error: 'Entry already reversed' });

        // 1. Create reversal entry
        const reversal = await prisma.$transaction(async (tx) => {
            const entry = await tx.journalEntry.create({
                data: {
                    transactionId: `REV-${original.transactionId}`,
                    accountId: original.accountId,
                    description: `Reversal of [${original.description}]`,
                    debit: original.credit, // Swap debit/credit
                    credit: original.debit,
                    date: new Date(),
                    status: 'Approved',
                    requestedBy: user.name
                }
            });

            // 2. Mark original as reversed
            await tx.journalEntry.update({
                where: { id },
                data: { status: 'Reversed' }
            });

            // 3. Update account balance (reverse the previous change)
            const account = original.account;
            let balanceChange = 0;
            // Original logic was: if Asset, change = debit - credit.
            // Reversal logic: if Asset, change = credit - debit (of original).
            if (['ASSET', 'EXPENSE'].includes(account.type)) {
                balanceChange = original.credit - original.debit;
            } else {
                balanceChange = original.debit - original.credit;
            }

            await tx.account.update({
                where: { id: original.accountId },
                data: { balance: { increment: balanceChange } }
            });

            return entry;
        });

        await logAction(
            user.id,
            user.name,
            'REVERSE_JOURNAL_ENTRY',
            `Reversed journal entry ${original.transactionId}`,
            { module: 'Finance' }
        );

        return res.status(201).json(reversal);
    } catch (error) {
        console.error('JOURNAL REVERSAL ERROR:', error);
        return res.status(500).json({ error: 'Failed to reverse journal entry' });
    }
}
