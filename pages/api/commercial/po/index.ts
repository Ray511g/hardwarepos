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
            const pos = await prisma.purchaseOrder.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(pos);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch POs' });
        }
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        const { supplierId, supplierName, items, totalAmount, department, requestedBy } = req.body;

        try {
            const po = await prisma.purchaseOrder.create({
                data: {
                    poNumber: `PO-${Date.now()}`,
                    supplierId,
                    supplierName,
                    items,
                    totalAmount: Number(totalAmount),
                    department,
                    status: 'PENDING',
                    budgetCheck: true // Simplified
                }
            });

            // Request approval
            await createApprovalRequest({
                entityType: 'PURCHASE_ORDER',
                entityId: po.id,
                requestedById: requestedBy?.id || user.id,
                requestedByName: requestedBy?.name || user.name,
                details: {
                    supplier: supplierName,
                    total: totalAmount,
                    department
                }
            });

            await logAction(
                user.id,
                user.name,
                'CREATE_PURCHASE_ORDER',
                `Generated PO for ${supplierName}`,
                { module: 'Commercial' }
            );

            return res.status(201).json(po);
        } catch (error) {
            console.error('PO ERROR:', error);
            return res.status(500).json({ error: 'Failed to create purchase order' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
