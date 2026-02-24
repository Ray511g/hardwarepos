import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const orders = await prisma.schoolServiceOrder.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
        const { studentId, serviceType, amount, recurring, frequency, nextBillingDate } = req.body;

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

        return res.status(201).json(order);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
