import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { createApprovalRequest } from '../../../../utils/approvals';
import { requireAuth, checkPermission } from '../../../../lib/auth';
import { logAction } from '../../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        try {
            const notes = await prisma.promissoryNote.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(notes);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch notes' });
        }
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        const { studentId, guardianName, amount, issueDate, maturityDate, requestedBy } = req.body;

        try {
            const note = await prisma.promissoryNote.create({
                data: {
                    noteNumber: `PN-${Date.now()}`,
                    studentId,
                    guardianName,
                    amount: Number(amount),
                    issueDate: new Date(issueDate),
                    maturityDate: new Date(maturityDate),
                    status: 'ACTIVE'
                }
            });

            // Request approval
            await createApprovalRequest({
                entityType: 'PROMISSORY_NOTE',
                entityId: note.id,
                requestedById: requestedBy?.id || user.id,
                requestedByName: requestedBy?.name || user.name,
                details: {
                    guardian: guardianName,
                    amount: amount,
                    due: maturityDate
                }
            });

            await logAction(
                user.id,
                user.name,
                'CREATE_PROMISSORY_NOTE',
                `Created promissory note for ${guardianName}`,
                { module: 'Commercial' }
            );

            return res.status(201).json(note);
        } catch (error) {
            console.error('NOTE ERROR:', error);
            return res.status(500).json({ error: 'Failed to create promissory note' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
