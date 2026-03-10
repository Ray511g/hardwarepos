import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        try {
            const tills = await (prisma as any).pOSTill.findMany({ orderBy: { tillNumber: 'asc' } });
            return res.status(200).json(tills);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch tills' });
        }
    }

    if (req.method === 'POST') {
        const { tillNumber, paybillNumber, accountNumber, description } = req.body;
        if (!tillNumber) return res.status(400).json({ error: 'Till number is required' });
        try {
            const till = await (prisma as any).pOSTill.create({
                data: { tillNumber, paybillNumber: paybillNumber || null, accountNumber: accountNumber || null, description: description || null }
            });
            return res.status(201).json(till);
        } catch (error: any) {
            if (error.code === 'P2002') return res.status(409).json({ error: 'Till number already exists' });
            return res.status(500).json({ error: 'Failed to create till' });
        }
    }

    if (req.method === 'PUT') {
        const { id, ...data } = req.body;
        if (!id) return res.status(400).json({ error: 'Till ID required' });
        try {
            const updated = await (prisma as any).pOSTill.update({ where: { id }, data });
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update till' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Till ID required' });
        try {
            await (prisma as any).pOSTill.delete({ where: { id: String(id) } });
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete till' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
