import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { createApprovalRequest } from '../../../../utils/approvals';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const notes = await prisma.promissoryNote.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(notes);
    }

    if (req.method === 'POST') {
        const { studentId, guardianName, amount, issueDate, maturityDate, requestedBy } = req.body;

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
            requestedById: requestedBy.id,
            requestedByName: requestedBy.name,
            details: {
                guardian: guardianName,
                amount: amount,
                due: maturityDate
            }
        });

        return res.status(201).json(note);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
