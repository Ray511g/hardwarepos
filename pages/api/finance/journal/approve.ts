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

    if (!checkPermission(user, 'finance', 'APPROVE', res)) return;

    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'Journal entry ID is required' });

        const entry = await prisma.journalEntry.update({
            where: { id },
            data: { status: 'Approved' }
        });

        await logAction(
            user.id,
            user.name,
            'APPROVE_JOURNAL_ENTRY',
            `Approved journal entry ${id}`,
            { module: 'Finance' }
        );

        return res.status(200).json(entry);
    } catch (error) {
        console.error('JOURNAL APPROVAL ERROR:', error);
        return res.status(500).json({ error: 'Failed to approve journal entry' });
    }
}
