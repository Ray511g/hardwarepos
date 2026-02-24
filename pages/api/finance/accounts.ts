import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, checkPermission } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        if (!checkPermission(user, 'finance', 'VIEW', res)) return;
        try {
            const accounts = await prisma.account.findMany({
                orderBy: { code: 'asc' }
            });
            return res.status(200).json(accounts);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch accounts' });
        }
    }

    if (req.method === 'POST') {
        if (!checkPermission(user, 'finance', 'CREATE', res)) return;
        try {
            const data = req.body;
            const account = await prisma.account.create({ data });
            return res.status(201).json(account);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create account' });
        }
    }

    if (req.method === 'PUT') {
        if (!checkPermission(user, 'finance', 'EDIT', res)) return;
        try {
            const { id } = req.query;
            const data = req.body;
            const account = await prisma.account.update({
                where: { id: id as string },
                data
            });
            return res.status(200).json(account);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update account' });
        }
    }

    if (req.method === 'DELETE') {
        if (!checkPermission(user, 'finance', 'DELETE', res)) return;
        try {
            const { id } = req.query;
            await prisma.account.delete({ where: { id: id as string } });
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete account' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
