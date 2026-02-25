import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../../lib/auth';
import { logAction } from '../../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        try {
            const orders = await prisma.schoolServiceOrder.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(orders);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch service orders' });
        }
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        const { studentId, serviceType, amount, recurring, frequency, nextBillingDate } = req.body;

        try {
            const order = await prisma.schoolServiceOrder.create({
                data: {
                    studentId,
                    serviceType,
                    amount: Number(amount),
                    recurring: Boolean(recurring),
                    frequency,
                    nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : null,
                    status: 'ACTIVE'
                }
            });

            await logAction(
                user.id,
                user.name,
                'CREATE_SERVICE_ORDER',
                `Enrolled student ${studentId} in ${serviceType}`,
                { module: 'Commercial' }
            );

            return res.status(201).json(order);
        } catch (error) {
            console.error('SERVICE ORDER ERROR:', error);
            return res.status(500).json({ error: 'Failed to create service order' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
