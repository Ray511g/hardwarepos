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
            const agreements = await prisma.creditAgreement.findMany({
                include: { installments: true },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(agreements);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch credit agreements' });
        }
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        const { studentId, studentName, guardianId, guardianName, totalAmount, installments, requestedBy } = req.body;

        try {
            const agreement = await prisma.creditAgreement.create({
                data: {
                    studentId,
                    studentName,
                    guardianId: guardianId || null,
                    guardianName,
                    totalAmount: Number(totalAmount),
                    status: 'PENDING',
                    installments: {
                        create: (installments || []).map((inst: any) => ({
                            dueDate: new Date(inst.dueDate),
                            amount: Number(inst.amount),
                            status: 'SCHEDULED'
                        }))
                    }
                },
                include: { installments: true }
            });

            // Request approval
            await createApprovalRequest({
                entityType: 'FEE_AGREEMENT',
                entityId: agreement.id,
                requestedById: requestedBy?.id || user.id,
                requestedByName: requestedBy?.name || user.name,
                details: {
                    student: studentName,
                    total: totalAmount,
                    installments: installments?.length || 0
                }
            });

            await logAction(
                user.id,
                user.name,
                'CREATE_CREDIT_AGREEMENT',
                `Created credit agreement for ${studentName}`,
                { module: 'Commercial' }
            );

            return res.status(201).json(agreement);
        } catch (error) {
            console.error('CREDIT ERROR:', error);
            return res.status(500).json({ error: 'Failed to create credit agreement' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
